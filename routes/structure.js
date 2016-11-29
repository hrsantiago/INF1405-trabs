var express = require('express');
var models = require('../config/models');
var bookshelf = require('../config/bookshelf');
var Promise = require('bluebird');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

router.get('/add/:transmissionLineId', function(req, res, next) {
  new models.TransmissionLine().where({id: req.params.transmissionLineId}).fetch({withRelated: ['owner'], require: true})
    .then(function(transmissionLine) {
      if(transmissionLine.related('owner').id != req.user.id)
        return res.status(400).json('Transmission line is not yours to add new structures.');
      return new models.Structure({transmission_line_id: transmissionLine.attributes.id, name: 'New structure'}).save();
    }).then(function(structure) {
      res.redirect('/structure/' + structure.attributes.id);
    }).catch(function(err) { next(err); });
});

router.post('/addmany/:transmissionLineId', function(req, res, next) {

  var length = req.body.length * 1000;
  var averageSpan = req.body.average_span;
  var initialSpan = req.body.initial_span;
  var angle = req.body.angle;

  var structures = Math.round(length / averageSpan);
  length = averageSpan * structures;
  var middleSpan = (length - 2 * initialSpan) / (structures - 2);

  var dx = middleSpan * Math.cos(angle);
  var dy = middleSpan * Math.sin(angle);

  var utmX = 0;
  var utmY = 0;

  var structureList = [];

  for(var i = 0; i <= structures; ++i) {
      structureList.push({name: 'Structure ' + i, utm_x: utmX, utm_y: utmY });

      if(i === 0 || i == structures - 1) {
        utmX += initialSpan * Math.cos(angle);
        utmY += initialSpan * Math.sin(angle);
      }
      else {
        utmX += dx;
        utmY += dy;
      }
  }

  new models.TransmissionLine().where({id: req.params.transmissionLineId}).fetch({withRelated: ['owner'], require: true})
    .then(function(transmissionLine) {
      if(transmissionLine.related('owner').id != req.user.id)
        return res.status(400).json('Transmission line is not yours to add a new structure.');

      return bookshelf.transaction(function(t) {
        return Promise.map(structureList, function(structure) {
          return new models.Structure(structure).save({transmission_line_id: transmissionLine.attributes.id}, {transacting: t});
        });
      });
      
    }).then(function(structure) {
      res.redirect('/transmissionline/' + req.params.transmissionLineId);
    }).catch(function(err) { next(err); });
});

router.get('/remove/:id', function(req, res, next) {
  var transmissionLineId;
  new models.Structure()
    .where({id: req.params.id})
    .fetch({withRelated: ['transmissionLine.owner'], require: true})
    .then(function(structure) {
      if(structure.related('transmissionLine').related('owner').id != req.user.id)
        return res.status(400).json('Structure is not yours to delete.');
      transmissionLineId = structure.attributes.transmission_line_id;
      return structure.destroy();
    }).then(function(model) {
      res.redirect('/transmissionline/' + transmissionLineId);
    }).catch(function(err) { next(err); });
});

router.get('/removeall/:transmissionLineId', function(req, res, next) {
  var transmissionLineId = req.params.transmissionLineId;
  new models.TransmissionLine()
    .where({id: req.params.transmissionLineId})
    .fetch({withRelated: ['owner', 'structures'], require: true})
    .then(function(transmissionLine) {
      if(transmissionLine.related('owner').id != req.user.id)
        return res.status(400).json('Structures are not yours to delete.');
      return transmissionLine.related('structures').invokeThen('destroy');
    }).then(function(model) {
      res.redirect('/transmissionline/' + transmissionLineId);
    }).catch(function(err) { next(err); });
});

router.get('/:id', function(req, res, next) {
  new models.Structure().where({id: req.params.id}).fetch({withRelated: ['transmissionLine.owner'], require: true}).then(function(structure) {
    if(structure.related('transmissionLine').related('owner').id != req.user.id)
      return res.status(400).json('Not your structure');
    res.render('structure', { user: req.user, structure: structure.toJSON() });
  }).catch(function(err) { next(err); });
});

router.post('/:id/save', function(req, res, next) {
  var body = {
    name: req.body.name,
    utm_x: req.body.utm_x,
    utm_y: req.body.utm_y,
    utm_zone: req.body.utm_zone,
    soil_resistivity: req.body.soil_resistivity,
    elevation: req.body.elevation,
  };

  new models.Structure().where({id: req.params.id}).fetch({withRelated: ['transmissionLine.owner'], require: true})
    .then(function(structure) {
      if(structure.related('transmissionLine').related('owner').id != req.user.id)
        return res.status(400).json('Not your structure');
      return structure.save(body, {patch: true});
    })
    .then(function(structure) {
      res.redirect("/structure/" + req.params.id);
    })
    .catch(function(err) { next(err); });
});

module.exports = router;
