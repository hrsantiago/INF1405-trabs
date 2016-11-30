var express = require('express');
var models = require('../config/models');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

router.post('/:id/save', function(req, res, next) {
  var phaseBody = {
    type: req.body.type,
  };

  var bundleBody = {
    x: req.body.x,
    y: req.body.y,
  };

  var circuitId;

  new models.Phase().where({id: req.params.id}).fetch({withRelated: ['circuit.transmissionLine.owner'], require: true})
    .then(function(phase) {
      if(phase.related('circuit').related('transmissionLine').related('owner').id != req.user.id)
        return res.status(400).json('Not your shield wire');
      circuitId = phase.related('circuit').attributes.id;
      return phase.save(phaseBody, {patch: true});
    })
    .then(function(phase) {
      return new models.Bundle().where({id: phase.attributes.bundle_id}).save(bundleBody, {patch: true});
    })
    .then(function(bundle) {
      res.redirect("/circuit/" + circuitId);
    })
    .catch(function(err) { next(err); });
});

module.exports = router;
