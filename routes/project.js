var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  if(req.isAuthenticated()) {
    req.getConnection(function(err,connection) {
    connection.query('SELECT * FROM company',[],function(err,result){
        if(err)
          return res.status(400).json(err);
        res.render('project', { title: 'Transmission Lines - Project', message: JSON.stringify(result) });
      });
    });
  }
  else {
    res.redirect('/login');
  }
});

module.exports = router;
