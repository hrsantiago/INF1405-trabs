var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mysql = require('mysql');
var mysqlConfig = require('./config/mysql');

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
require('./config/passport')(passport);

require('./config/bookshelf');

var index = require('./routes/index');
var logout = require('./routes/logout');
var userRoute = require('./routes/user');
var project = require('./routes/project');
var transmissionLine = require('./routes/transmissionline');
var circuit = require('./routes/circuit');
var shieldWire = require('./routes/shieldwire');
var structure = require('./routes/structure');
var cableType = require('./routes/cabletype');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  key: 'session_cookie_transmissionlines',
  secret: '123transmissionlines34',
  store: new MySQLStore(mysqlConfig),
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', index);
app.use('/logout', logout);
app.use('/user', userRoute);
app.use('/project', project);
app.use('/transmissionline', transmissionLine);
app.use('/circuit', circuit);
app.use('/shieldwire', shieldWire);
app.use('/structure', structure);
app.use('/cabletype', cableType);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
