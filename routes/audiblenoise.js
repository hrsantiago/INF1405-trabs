var express = require('express');
var models = require('../config/models');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

router.get('/run/transmissionline/:id', function(req, res, next) {
  res.render('audiblenoise', { user: req.user });
});

router.post('/:id/save', function(req, res, next) {
  var audibleNoiseBody = {
    maximum_level_at_border: req.body.maximum_level_at_border,
  };

  var profileBody = {
    initial_x: req.body.initial_x,
    final_x: req.body.final_x,
    increment_x: req.body.increment_x,
    height: req.body.height,
  };

  var transmissionLineId;

  new models.AudibleNoise().where({id: req.params.id}).fetch({withRelated: ['transmissionLine.owner'], require: true})
    .then(function(audibleNoise) {
      if(audibleNoise.related('transmissionLine').related('owner').id != req.user.id)
        return res.status(400).json('Not your audible noise');
      transmissionLineId = audibleNoise.attributes.transmission_line_id;
      return audibleNoise.save(audibleNoiseBody, {patch: true});
    })
    .then(function(audibleNoise) {
      return new models.Profile().where({id: audibleNoise.attributes.profile_id}).save(profileBody, {patch: true});
    })
    .then(function(profile) {
      res.redirect("/transmissionline/" + transmissionLineId);
    })
    .catch(function(err) { next(err); });
});

module.exports = router;
