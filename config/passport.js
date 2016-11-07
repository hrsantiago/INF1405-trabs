var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database:'transmissionlines'
});

// expose this function to our app using module.exports
module.exports = function(passport) {

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    connection.query("select * from user where id = "+id,function(err,rows) {
      done(err, rows[0]);
    });
  });

  passport.use('local-login', new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    connection.query("SELECT * FROM `user` WHERE `email` = '" + email + "'",function(err,rows) {
      if(err)
        return done(err);
      if(!rows.length) {
        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
      }
      
      // if the user is found but the password is wrong
      if(!(rows[0].password == password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return done(null, rows[0]);     
  
    });
  }));
};
