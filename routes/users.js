const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Teacher = require('../models/teacher');
const createError = require('http-errors');
const Checker = require('../permission_checker');
const Subject = require('../models/subject');


router.get('/edit', function (req, res) {

  Teacher.findById(req.user.teacherData)
    .then(teacher => {
      res.render('user_edit', { teacher: teacher, auth: Checker.authData(req) });
    })
    .catch(err => { res.status(500).send(err.toString()); });
});

router.get('/teacher/new', Checker.checkAuth, (req, res) => {
  res.render('teacher_new', { auth: Checker.authData(req) });
});

router.post('/edit', Checker.checkAuth, (req, res) => {

  let fullname = req.body.fullname;
  let headline = req.body.headline;
  let linkedin = req.body.linkedin;
  let facebook = req.body.facebook;
  let reddit = req.body.reddit;
  let twitter = req.body.twitter;

  let user = req.user;

  if (fullname) { user.fullname = fullname; }

  user.save()
    .then((user) => {
      return Teacher.findById(user.teacherData);
    })
    .then((teacher) => {

      if (headline) { teacher.headline = headline; }
      if (linkedin) { teacher.linkedin = linkedin; }
      if (facebook) { teacher.facebook = facebook; }
      if (reddit) { teacher.reddit = reddit; }
      if (twitter) { teacher.twitter = twitter; }

      teacher.save();
    })
    .then(() => res.redirect('/'))
    .catch(err => { res.status(500).send(err.toString()); });
});

router.post('/teacher/new', Checker.checkAuth, (req, res) => {

  let headline = req.body.headline;
  let linkedin = req.body.linkedin;
  let facebook = req.body.facebook;
  let reddit = req.body.reddit;
  let twitter = req.body.twitter;

  let teacher = {
    headline: headline,
    linkedin: linkedin,
    facebook: facebook,
    reddit: reddit,
    twitter: twitter
  };

  Promise.all([
    Teacher(teacher).save()
  ])
    .then((teacher) => {

      let user = req.user;

      if (teacher[0]._id) { user.teacherData = teacher[0]._id; }

      user.save();
    })
    .then(() => res.redirect('/'))
    .catch(err => { res.status(500).send(err.toString()); });
});

//req.user.teacherData

router.get('/admin/:id', function (req, res, next) {
  User.findById(req.params.id)
    .then(user => {
      if (user) {

        if (user.role === 1) {

          User.findByIdAndUpdate(req.params.id,
            { $set: { role: 0 } },
            function (err) {
              if (err) res.status(500).send(err.toString());
              res.redirect('/');
            });

        } else {

          User.findByIdAndUpdate(req.params.id,
            { $set: { role: 1 } },
            function (err) {
              if (err) res.status(500).send(err.toString());
              res.redirect('/');
            });

        }
      } else {
        next(createError(404));
      }
    })
    .catch(err => { res.status(500).send(err.toString()); });
});

router.get('/', Checker.checkAdmin, function (req, res) {
  User.find()
    .then(users => {
      res.render("users", { users, auth: Checker.authData(req) });
    })
    .catch(err => { res.status(500).send(err.toString()); });
});

// res.render('user', { user: user, auth: Checker.authData(req) });

router.get('/:id', function (req, res) {
  User.findById(req.params.id)
    .then(user => {
      if (user) {

        if(!user.teacherData){

          let isEditEnabled = false;
          let isAdmin = true;

          if(user.id === req.user.id){ isEditEnabled = true; }
          if(user.role === 1){ isAdmin = false; }

          res.render('user', { user: user, auth: Checker.authData(req), isEditEnabled: isEditEnabled, isAdmin: isAdmin});
          return;
        }

        Teacher.findById(user.teacherData)
          .then(teacher => {
            let temp = Array.from(teacher.subjects);
            return Promise.all([teacher, Subject.find(
              { _id: { $in: temp  } })]
           );
          })
          .then(([teacher, subjects]) => {

            let isEditEnabled = false;
            let isAdmin = true;

            if(user.id === req.user.id){ isEditEnabled = true; }
            if(user.role === 1){ isAdmin = false; }

            res.render('user', { user: user, teacher: teacher, subjects: subjects, auth: Checker.authData(req), isEditEnabled: isEditEnabled, isAdmin: isAdmin});
          })
          .catch(err => { res.status(500).send(err.toString()); });

      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => { res.status(500).send(err.toString()); });
});

module.exports = router;  
