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
        return res.status(400).json('Transmission line is not yours to add a new shield wire.');
      return new models.ShieldWire({transmission_line_id: transmissionLine.attributes.id}).save();
    }).then(function(shieldWire) {
      res.redirect('/shieldWire/' + shieldWire.attributes.id);
    }).catch(function(err) { next(err); });
});

router.get('/remove/:id', function(req, res, next) {
  var transmissionLineId;
  new models.ShieldWire()
    .where({id: req.params.id})
    .fetch({withRelated: ['transmissionLine.owner'], require: true})
    .then(function(shieldWire) {
      if(shieldWire.related('transmissionLine').related('owner').id != req.user.id)
        return res.status(400).json('Shield wire is not yours to delete.');
      transmissionLineId = shieldWire.attributes.transmission_line_id;
      return shieldWire.destroy();
    }).then(function(model) {
      res.redirect('/transmissionline/' + transmissionLineId);
    }).catch(function(err) { next(err); });
});

router.get('/:id', function(req, res, next) {
  new models.ShieldWire().where({id: req.params.id}).fetch({withRelated: ['transmissionLine.owner'], require: true}).then(function(shieldWire) {
    if(shieldWire.related('transmissionLine').related('owner').id != req.user.id)
      return res.status(400).json('Not your shield wire');
    res.render('shieldwire', { user: req.user, shieldWire: shieldWire.toJSON() });
  }).catch(function(err) { next(err); });
});

router.post('/:id/save', function(req, res, next) {
  var body = {
    x: req.body.x,
    y: req.body.y,
    sag: req.body.sag,
  };

  new models.ShieldWire().where({id: req.params.id}).fetch({withRelated: ['transmissionLine.owner'], require: true})
    .then(function(shieldWire) {
      if(shieldWire.related('transmissionLine').related('owner').id != req.user.id)
        return res.status(400).json('Not your shield wire');
      return shieldWire.save(body, {patch: true});
    })
    .then(function(shieldWire) {
      res.redirect("/shieldwire/" + req.params.id);
    })
    .catch(function(err) { next(err); });
});

module.exports = router;
