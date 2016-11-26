var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
  if(!req.isAuthenticated())
    res.redirect('/');
  else
    next();
});

router.get('/', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
