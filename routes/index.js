var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Transmission Lines', message: req.flash('loginMessage') });
});

router.post("/", passport.authenticate("local-login", { failureRedirect: "/", failureFlash : true }), function (req, res) {
  res.redirect("/user");
});


module.exports = router;
