const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mustache_express = require("mustache-express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const bcrypt = require('bcrypt');

const dbUrl = 'mongodb://firmeldir:pppppp1@ds353748.mlab.com:53748/heroku_v204gnxv';
const connectOptions = { useNewUrlParser: true, useUnifiedTopology: true ,  useFindAndModify: false };

mongoose.connect(dbUrl, connectOptions)
  .then(() => console.log('mongodb://firmeldir:password0923@ds221003.mlab.com:21003/heroku_qlsv2hhd OK'))
  .catch(() => console.log('mongodb://firmeldir:password0923@ds221003.mlab.com:21003/heroku_qlsv2hhd ERROR'));

const app = express();

app.engine('mst', mustache_express());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mst');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => { done(err, null); });
});

passport.use(new LocalStrategy({
  usernameField: 'login',
  passwordField: 'password',
  passReqToCallback: true
}, login));


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');
const subjectsRouter = require('./routes/subjects');
const apiUsersRouter = require('./routes/api_users');
const aboutRouter = require('./routes/about');
const dataRouter = require('./routes/data');
const developerRouter = require('./routes/developer');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth')(app, passport).router;


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tasks', tasksRouter);
app.use('/subjects', subjectsRouter);
app.use('/api/users', apiUsersRouter);
app.use('/about', aboutRouter);
app.use('/data/fs', dataRouter);
app.use('/auth', authRouter);
app.use('/developer/v1', developerRouter);
app.use('/api/v1', apiRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.jade');
});

function login(req, login, password, done) {

  User.findOne({ login: login })
    .then(user => {

      if (user) {
        return user;
      } else {
        done(Error("This user does not exist."), null);
        return;
      }
    })
    .then(user => {

      bcrypt.compare(password, user.passwordHash, function (err, res) {
        if (res === true) {
          done(null, user);
        }
        else {
          done(Error("Incorrect login or password."), null);
        }
      });
    })
    .catch(err => { done(err, null); });
}

module.exports = app;
