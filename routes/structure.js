var express = require('express');
var models = require('../config/models');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

router.get('/add/:transmissionLineId', function(req, res, next) {
  var transmissionLineId = req.params.transmissionLineId;

  new models.TransmissionLine().where({id: transmissionLineId}).fetch({withRelated: ['owner'], require: true})
    .then(function(transmissionLine) {
      if(transmissionLine.related('owner').id != req.user.id)
        return res.status(400).json('Transmission line is not yours to add a new structure.');
      return new models.Structure({transmission_line_id: transmissionLine.attributes.id, name: 'New structure'}).save();
    }).then(function(structure) {
      res.redirect('/structure/' + structure.attributes.id);
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
