var express = require('express');
var models = require('../config/models');
var math = require('mathjs');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

function getFieldEllipseMaximum(p)
{
  var fxm = math.abs(p[0]);
  var fxa = math.arg(p[0]);
  var fym = math.abs(p[1]);
  var fya = math.arg(p[1]);
  var fzm = math.abs(p[2]);
  var fza = math.arg(p[2]);
  var wt = 0.5 * math.atan(-(fxm*fxm*math.sin(2*fxa) + fym*fym*math.sin(2*fya) + fzm*fzm*math.sin(2*fza)) /
                            (fxm*fxm*math.cos(2*fxa) + fym*fym*math.cos(2*fya) + fzm*fzm*math.cos(2*fza)));

  var et1 = [fxm*math.sin(wt + fxa), fym*math.sin(wt + fya), fzm*math.sin(wt + fza)];
  wt += Math.PI / 2;
  var et2 = [fxm*math.sin(wt + fxa), fym*math.sin(wt + fya), fzm*math.sin(wt + fza)];

  return math.max(math.norm(et1), math.norm(et2));
}

function calculateProfileField(transmissionLine)
{
  var magneticFieldProfile = [];

  var profile = transmissionLine.magneticField.profile;
  var x0 = profile.initial_x;
  var x1 = profile.final_x;
  var dx = profile.increment_x;

  var w = 2 * Math.PI * transmissionLine.frequency;
  var sigma = 1.0 / 1000; // soil resistivity
  var j = math.complex(0, 1);
  var u0 = 4 * Math.PI * 1E-07;
  var p = math.divide(-2.0, math.sqrt(math.multiply(j, w, u0, sigma)));

  for(var x = x0; x <= x1; x += dx) {
    var position = [x, 0, profile.height];
    var b = [0, 0, 0];

    var circuits = transmissionLine.circuits;
    for(c = 0; c < circuits.length; c++) {
      var circuit = circuits[c];
      var phases = circuit.phases;
      for(ph = 0; ph < phases.length; ph++) {
        var phase = phases[ph];
        var angle = 0;
        if(phase.type == 2)
          angle = -120 * Math.PI / 180;
        else if(phase.type == 3)
          angle = 120 * Math.PI / 180;

        var bundle = phase.bundle;
        var cables = bundle.cables;
        var current = circuit.short_term_current_capacity / cables.length;

        for(ca = 0; ca < cables.length; ca++) {
          var cable = cables[ca];
          var i = math.multiply(current, math.exp(math.multiply(j, angle)));
          var cx = bundle.x + cable.x;
          var cy = bundle.y + cable.y - circuit.conductor_sag;
          var cablePos = [cx, 0, cy];

          var d = math.distance(cablePos, position);
          var ri = [0, 1, 0];
          var r = math.divide(math.subtract(position, cablePos), math.norm(math.subtract(position, cablePos)));
          b = math.add(b, math.multiply(math.cross(ri, r), math.divide(i, d)));

          cablePos = [cx, 0, -cy - math.im(p)];
          var dl = math.distance(cablePos, position);
          var ril = [0, -1, 0];
          var rl = math.divide(math.subtract(position, cablePos), math.norm(math.subtract(position, cablePos)));
          b = math.add(b, math.multiply(math.cross(ril, rl), math.divide(i, dl)));
        }
      }
    }
    b = math.multiply(b, 1E06 * u0 / (2 * Math.PI));
    console.log(x, b);

    var bMax = getFieldEllipseMaximum(b);
    magneticFieldProfile.push({x: x, b: bMax});
  }
  return magneticFieldProfile;
}

router.get('/run/transmissionline/:id', function(req, res, next) {
  new models.TransmissionLine().where({id: req.params.id}).fetch({withRelated: ['owner', 'circuits.phases.bundle.cables', 'structures', 'magneticField.profile'], require: true}).then(function(transmissionLine) {
    if(transmissionLine.related('owner').id != req.user.id)
      return res.status(400).json('Not your transmission line');

    var magneticFieldProfile = calculateProfileField(transmissionLine.toJSON());

    res.render('magneticfield', { user: req.user, transmissionLine: transmissionLine.toJSON(), magneticFieldProfile: magneticFieldProfile });
  }).catch(function(err) { next(err); });
});

router.post('/:id/save', function(req, res, next) {
  var applicationBody = {
    maximum_level_at_border: req.body.maximum_level_at_border,
  };

  var profileBody = {
    initial_x: req.body.initial_x,
    final_x: req.body.final_x,
    increment_x: req.body.increment_x,
    height: req.body.height,
  };

  var transmissionLineId;

  new models.MagneticField().where({id: req.params.id}).fetch({withRelated: ['transmissionLine.owner'], require: true})
    .then(function(application) {
      if(application.related('transmissionLine').related('owner').id != req.user.id)
        return res.status(400).json('Not your audible noise');
      transmissionLineId = application.attributes.transmission_line_id;
      return application.save(applicationBody, {patch: true});
    })
    .then(function(application) {
      return new models.Profile().where({id: application.attributes.profile_id}).save(profileBody, {patch: true});
    })
    .then(function(profile) {
      res.redirect("/transmissionline/" + transmissionLineId);
    })
    .catch(function(err) { next(err); });
});

module.exports = router;
