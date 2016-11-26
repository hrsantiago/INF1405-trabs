var express = require('express');
var passport = require('passport');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.getConnection(function(err,connection) {
    connection.query('SELECT * FROM project WHERE owner_id = ?',[req.user.id],function(err,result){
      if(err)
        return res.status(400).json(err);
      res.render('projects', { title: 'Transmission Lines - Project', user: req.user, projects: result });
    });
  });
});

router.get('/add', function(req, res, next) {
  req.getConnection(function(err,connection) {
    connection.query('INSERT INTO project (owner_id, name) VALUES (?, ?)',[req.user.id, 'New project'],function(err,result){
      if(err)
        return res.status(400).json(err);

      res.redirect('/project/' + result.insertId);
    });
  });
});

router.get('/remove/:id', function(req, res, next) {
  var projectId = req.params.id;

  req.getConnection(function(err,connection) {
    connection.query('DELETE FROM project WHERE id = ? AND owner_id = ?',[projectId, req.user.id],function(err,result){
      if(err)
        return res.status(400).json(err);
      res.redirect('/project');
    });
  });
});

router.get('/:id', function(req, res, next) {
  var projectId = req.params.id;

  req.getConnection(function(err,connection) {
    connection.query('SELECT * FROM project WHERE id = ? AND owner_id = ?',[projectId, req.user.id],function(err,result){
      if(err)
        return res.status(400).json(err);

      connection.query('SELECT * FROM transmission_line WHERE project_id = ?',[projectId],function(err,result2){
        if(err)
          return res.status(400).json(err);

        res.render('project', { title: 'Transmission Lines - Project', message: JSON.stringify(result), user: req.user, project: result[0], transmissionLines: result2 });
      });
    });
  });
});

router.post('/:id/save', function(req, res, next) {
  var projectId = req.params.id;

  req.getConnection(function(err,connection) {
    connection.query('UPDATE project SET name = ?, description = ? WHERE id = ? AND owner_id = ?',
    [req.body.name, req.body.description, projectId, req.user.id],function(err,result){
      if(err)
        return res.status(400).json(err);
      res.redirect("/project/" + projectId);
    });
  });
});

module.exports = router;
