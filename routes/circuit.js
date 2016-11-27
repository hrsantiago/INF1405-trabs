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
        return res.status(400).json('Transmission line is not yours to add a new circuit.');
      return new models.Circuit({transmission_line_id: transmissionLine.attributes.id}).save();
    }).then(function(circuit) {
      res.redirect('/circuit/' + circuit.attributes.id);
    }).catch(function(err) { next(err); });
});

router.get('/remove/:id', function(req, res, next) {
  var transmissionLineId;
  new models.Circuit()
    .where({id: req.params.id})
    .fetch({withRelated: ['transmissionLine.owner'], require: true})
    .then(function(circuit) {
      if(circuit.related('transmissionLine').related('owner').id != req.user.id)
        return res.status(400).json('Circuit is not yours to delete.');
      transmissionLineId = circuit.attributes.transmission_line_id;
      return circuit.destroy();
    }).then(function(model) {
      res.redirect('/transmissionline/' + transmissionLineId);
    }).catch(function(err) { next(err); });
});

router.get('/:id', function(req, res, next) {
  new models.Circuit().where({id: req.params.id}).fetch({withRelated: ['transmissionLine.owner'], require: true}).then(function(circuit) {
    if(circuit.related('transmissionLine').related('owner').id != req.user.id)
      return res.status(400).json('Not your circuit');
    res.render('circuit', { user: req.user, circuit: circuit.toJSON() });
  }).catch(function(err) { next(err); });
});

router.post('/:id/save', function(req, res, next) {
  var body = {
    nominal_voltage: req.body.nominal_voltage,
    maximum_voltage: req.body.maximum_voltage,
    short_term_current_capacity: req.body.short_term_current_capacity,
    conductor_surface_factor: req.body.conductor_surface_factor,
    conductor_sag: req.body.conductor_sag,
    conductor_short_term_sag: req.body.conductor_short_term_sag,
    conductor_long_term_sag: req.body.conductor_long_term_sag,
  };

  new models.Circuit().where({id: req.params.id}).fetch({withRelated: ['transmissionLine.owner'], require: true})
    .then(function(circuit) {
      if(circuit.related('transmissionLine').related('owner').id != req.user.id)
        return res.status(400).json('Not your circuit');
      return circuit.save(body, {patch: true});
    })
    .then(function(circuit) {
      res.redirect("/circuit/" + req.params.id);
    })
    .catch(function(err) { next(err); });
});

module.exports = router;
