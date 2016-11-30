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
  new models.Project({owner_id: req.user.id, name: 'New project'}).save().then(function(project) {
    res.redirect('/project/' + project.attributes.id);
  }).catch(function(err) { next(err); });
});

router.get('/remove/:id', function(req, res, next) {
  new models.Project().where({id: req.params.id, owner_id: req.user.id}).destroy().then(function(project) {
    res.redirect('/user');
  }).catch(function(err) { next(err); });
});

router.get('/:id', function(req, res, next) {
  new models.Project().where({id: req.params.id, owner_id: req.user.id}).fetch({withRelated: ['transmissionLines'], require: true}).then(function(project) {
    res.render('project', { user: req.user, project: project.toJSON(), transmissionLines: project.related('transmissionLines').toJSON() });
  }).catch(function(err) { next(err); });
});

router.post('/:id/save', function(req, res, next) {
  var body = {
    name: req.body.name,
    description: req.body.description,
  };

  new models.Project().where({id: req.params.id, owner_id: req.user.id}).save(body, {patch: true}).then(function(project) {
    res.redirect("/project/" + req.params.id);
  }).catch(function(err) { next(err); });
});

module.exports = router;
