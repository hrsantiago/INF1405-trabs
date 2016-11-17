var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  if(req.isAuthenticated()) {
    req.logout();
  }
  res.redirect('/');
});

module.exports = router;
