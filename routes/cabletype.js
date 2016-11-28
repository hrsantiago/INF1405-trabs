var express = require('express');
var models = require('../config/models');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

router.get('/add', function(req, res, next) {
  new models.CableType({owner_id: req.user.id, code: 'New cable type'}).save().then(function(cableType) {
    res.redirect('/cabletype/' + cableType.attributes.id);
  }).catch(function(err) { next(err); });
});

router.get('/remove/:id', function(req, res, next) {
  new models.CableType().where({id: req.params.id, owner_id: req.user.id}).destroy().then(function(cableType) {
    res.redirect('/user');
  }).catch(function(err) { next(err); });
});

router.get('/:id', function(req, res, next) {
  new models.CableType().where({id: req.params.id, owner_id: req.user.id}).fetch({require: true}).then(function(cableType) {
    res.render('cabletype', { user: req.user, cableType: cableType.toJSON() });
  }).catch(function(err) { next(err); });
});

router.post('/:id/save', function(req, res, next) {
  var body = {
    code: req.body.code,
    type: req.body.type,
    size: req.body.size,
    stranding: req.body.stranding,
    diameter: req.body.diameter,
  };

  new models.CableType().where({id: req.params.id, owner_id: req.user.id}).save(body, {patch: true}).then(function(cableType) {
    res.redirect("/cabletype/" + req.params.id);
  }).catch(function(err) { next(err); });
});

module.exports = router;
