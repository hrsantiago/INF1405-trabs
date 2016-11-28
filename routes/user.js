var express = require('express');
var models = require('../config/models');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

router.get('/', function(req, res, next) {
  new models.User().where({'id' : req.user.id}).fetch({withRelated: ['projects', 'cableTypes'], require: true}).then(function(user) {
    res.render('user', { user: req.user, projects: user.related('projects').toJSON(), cableTypes: user.related('cableTypes').toJSON() });
  }).catch(function(err) { next(err); });
});

module.exports = router;
