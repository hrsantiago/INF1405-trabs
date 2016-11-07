var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var text = "";
  text += "<p>" + req.flash('loginMessage') + "</p>";
  text += "<p>Please login!</p><form method='post' action='/login'><input type='text' name='username' value='henrique_santiago93@hotmail.com'/><input type='password' name='password'/><button type='submit' value='submit'>Submit</buttom></form>";

  res.send(text);
});

router.post("/", passport.authenticate("local-login", { failureRedirect: "/login", failureFlash : true }), function (req, res) {
  res.redirect("/content");
});

module.exports = router;
