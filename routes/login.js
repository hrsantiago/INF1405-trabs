var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Transmission Lines - Login', message: req.flash('loginMessage') });
});

router.post("/", passport.authenticate("local-login", { failureRedirect: "/login", failureFlash : true }), function (req, res) {
  res.redirect("/project");
});

module.exports = router;
