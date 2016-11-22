var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  req.getConnection(function(err,connection) {
  connection.query('SELECT * FROM project',[],function(err,result){
      if(err)
        return res.status(400).json(err);
      res.render('projects', { title: 'Transmission Lines - Project', message: JSON.stringify(result), user: req.user, projects: result });
    });
  });
});

router.get('/add', function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  req.getConnection(function(err,connection) {
  connection.query('INSERT INTO project (owner_id, name) VALUES (?, ?)',[req.user.id, 'New project'],function(err,result){
      if(err)
        return res.status(400).json(err);
      res.redirect('/project');
    });
  });
});

router.get('/remove/:id', function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  var projectId = req.params.id;

  req.getConnection(function(err,connection) {
  connection.query('DELETE FROM project WHERE id = ? and owner_id = ?',[projectId, req.user.id],function(err,result){
      if(err)
        return res.status(400).json(err);
      res.redirect('/project');
    });
  });
});

router.get('/:id', function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  var projectId = req.params.id;

  req.getConnection(function(err,connection) {
  connection.query('SELECT * FROM project WHERE id = ? AND owner_id = ?',[projectId, req.user.id],function(err,result){
      if(err)
        return res.status(400).json(err);
      res.render('project', { title: 'Transmission Lines - Project', message: JSON.stringify(result), user: req.user, project: result[0] });
    });
  });
});

module.exports = router;
