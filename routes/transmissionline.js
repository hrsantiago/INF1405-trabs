var express = require('express');
var passport = require('passport');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

router.get('/add/:projectId', function(req, res, next) {
  var projectId = req.params.projectId;

  req.getConnection(function(err,connection) {
    connection.query('INSERT INTO transmission_line (project_id, name) VALUES (?, ?)',[projectId, 'New transmission line'],function(err,result){
      if(err)
        return res.status(400).json(err);

      res.redirect('/transmissionline/' + result.insertId);
    });
  });
});

router.get('/remove/:id', function(req, res, next) {
  var transmissionLineId = req.params.id;

  req.getConnection(function(err,connection) {
    connection.query('DELETE FROM transmission_line WHERE id = ?',[transmissionLineId],function(err,result){
      if(err)
        return res.status(400).json(err);

      res.redirect('/project');
    });
  });
});

router.get('/:id', function(req, res, next) {
  var transmissionLineId = req.params.id;

  req.getConnection(function(err,connection) {
    connection.query('SELECT * FROM transmission_line WHERE id = ?',[transmissionLineId],function(err,result){
      if(err)
        return res.status(400).json(err);

      res.render('transmissionline', { title: 'Transmission Lines - Project', message: JSON.stringify(result), user: req.user, transmissionLine: result[0] });
    });
  });
});

router.post('/:id/save', function(req, res, next) {
  var transmissionLineId = req.params.id;

  req.getConnection(function(err,connection) {
    connection.query('UPDATE transmission_line SET name = ?, frequency = ?, average_rainfall = ?, relative_air_density_50 = ?, relative_air_density_90 = ?, max_circuits = ?, max_shield_wires = ? WHERE id = ?',
    [req.body.name, req.body.frequency, req.body.average_rainfall, req.body.relative_air_density_50, req.body.relative_air_density_90, req.body.max_circuits, req.body.max_shield_wires, transmissionLineId],function(err,result){
      if(err)
        return res.status(400).json(err);
      res.redirect("/transmissionline/" + transmissionLineId);
    });
  });
});

module.exports = router;
