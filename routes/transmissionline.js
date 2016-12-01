var express = require('express');
var models = require('../config/models');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

router.get('/add/:projectId', function(req, res, next) {
  var projectId = req.params.projectId;

  new models.Project().where({id: projectId, owner_id: req.user.id}).fetch({require: true})
    .then(function(project) {
      return new models.TransmissionLine({project_id: projectId, name: 'New transmission line'}).save();
    }).then(function(transmissionLine) {
      res.redirect('/transmissionline/' + transmissionLine.attributes.id);
    }).catch(function(err) { next(err); });
});

router.get('/remove/:id', function(req, res, next) {
  var projectId;
  new models.TransmissionLine()
    .where({id: req.params.id})
    .fetch({withRelated: ['owner'], require: true})
    .then(function(transmissionLine) {
      if(transmissionLine.related('owner').id != req.user.id)
        return res.status(400).json('Transmission line is not yours to delete.');
      projectId = transmissionLine.attributes.project_id;
      return transmissionLine.destroy();
    }).then(function(model) {
      res.redirect('/project/' + projectId);
    }).catch(function(err) { next(err); });
});

router.get('/:id', function(req, res, next) {
  new models.TransmissionLine().where({id: req.params.id}).fetch({withRelated: ['owner', 'circuits', 'shieldWires.bundle', 'structures', 'magneticField.profile'], require: true}).then(function(transmissionLine) {
    if(transmissionLine.related('owner').id != req.user.id)
      return res.status(400).json('Not your transmission line');
    res.render('transmissionline', { user: req.user, transmissionLine: transmissionLine.toJSON() });
  }).catch(function(err) { next(err); });
});

router.post('/:id/save', function(req, res, next) {
  var body = {
    name: req.body.name,
    frequency: req.body.frequency,
    average_rainfall: req.body.average_rainfall,
    relative_air_density_50: req.body.relative_air_density_50,
    relative_air_density_90: req.body.relative_air_density_90,
    max_circuits: req.body.max_circuits,
    max_shield_wires: req.body.max_shield_wires
  };

  new models.TransmissionLine().where({id: req.params.id}).fetch({withRelated: ['owner'], require: true})
    .then(function(transmissionLine) {
      if(transmissionLine.related('owner').id != req.user.id)
        return res.status(400).json('Not your transmission line');
      return transmissionLine.save(body, {patch: true});
    })
    .then(function(transmissionLine) {
      res.redirect("/transmissionline/" + req.params.id);
    })
    .catch(function(err) { next(err); });
});

module.exports = router;
