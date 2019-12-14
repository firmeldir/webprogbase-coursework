const express = require('express');
const router = express.Router();
const Subject = require('../models/subject');
const Task = require('../models/task');
const createError = require('http-errors');
const Checker = require('../permission_checker');
const Teacher = require('../models/teacher');
const User = require('../models/user');

router.get('/edit/:id', function (req, res,  next) {

    Subject.findById(req.params.id)
        .then(subject => {
            if (subject) {
                res.render('subject_edit', { subject: subject, auth: Checker.authData(req) });
            } else {
                next(createError(404));
            }
    })
    .catch(err => { res.status(500).send(err.toString()); });      
  });
  
  router.get('/teacher/new', Checker.checkAuth, (req, res) => {
    res.render('teacher_new', { auth: Checker.authData(req) });
  });
  
  router.post('/edit/:id', Checker.checkAuth, (req, res, next) => {

    Subject.findById(req.params.id)
        .then(subject => {
            if (subject) {

                if (req.body.name) { subject.name = req.body.name; }
                if (req.body.description) { subject.description = req.body.description; }
                if (req.body.price) { subject.price = req.body.price; }

                return subject.save();

            } else {
                next(createError(404));
            }
        })
        .then(subject => res.redirect('/subjects/' + subject._id))
        .catch(err => { res.status(500).send(err.toString()); });
  });





router.get('/new', Checker.checkAuth, function (req, res) {
    res.render('subject_new', { auth: Checker.authData(req) });
});

router.post('/new', Checker.checkAuth, function (req, res) {

    let body = req.body;

    let subject = {
        name: body.title,
        description: body.description,
        price: body.price,
    };

    Subject(subject).save()
        .then(subject => {

            Teacher.findByIdAndUpdate(req.user.teacherData,
                { $push: { subjects: subject.id } },
                function (err) {
                    if (err) res.status(500).send(err.toString());
                });

            return subject;
        })
        .then(subject => res.redirect('/subjects/' + subject._id))
        .catch(err => { res.status(500).send(err.toString()); });
});





router.post('/:id', Checker.checkAuth, (req, res) => {
    Subject.remove({ _id: req.params.id })
        .then(() => {

            Teacher.findOneAndUpdate(req.user.teacherData,
                { $pull: { subjects: { $in: req.params.id } } }, { multi: true },
                function (err) {
                    if (err) res.status(500).send(err.toString());
                });
        })
        .then(() => { res.redirect('/subjects'); })
        .catch(err => { res.status(500).send(err.toString()); });
});





router.get('/', Checker.checkAuth, function (req, res) {
    Subject.find()
        .then(subjects => {

            let isEnableToCreateNew = false;

            if(req.user.teacherData){
                isEnableToCreateNew = true;
            }

            res.render('subjects', { subjects: subjects, auth: Checker.authData(req), isEnableToCreateNew: isEnableToCreateNew});
        })
        .catch(err => { res.status(500).send(err.toString()); });
});

router.get('/:id', Checker.checkAuth, function (req, res) {

    if(req.params.id.length !== 24){
        res.sendStatus(404);
      }

    Subject.findById(req.params.id)
        .then(subject => {
            if (subject) {
                return Promise.all([subject, Teacher.find({ subjects: { $elemMatch: { $in: subject.id } } })]);
            } else {
                res.sendStatus(404);
            }
        })
        .then(([subject, teachers]) => {
            let promises = [];
            
            for (let i in teachers) {
                promises.push(User.find({ teacherData: teachers[i].id }));
            }
            
            return Promise.all([subject, Task.find({ subject: subject._id }), Promise.all(promises)]);
        })
        .then(([subject, tasks, lecturers]) => {

            let isLecturer = false;

            for(let lecturer of lecturers[0]){
                
                if(lecturer.id === req.user.id){
                    isLecturer = true;
                }
            }

            if(!req.user.teacherData){ isLecturer = false; console.log("USER.teacherData -----> is undefined");}

            if(lecturers.length === 0){
                res.render('subject', { subject: subject, tasks: tasks, auth: Checker.authData(req), isLecturer: isLecturer });
            }else{
                res.render('subject', { subject: subject, lecturers: lecturers[0], tasks: tasks, auth: Checker.authData(req) , isLecturer: isLecturer});
            }
        })
        .catch(err => { res.status(500).send(err.toString()); });
});


module.exports = router;  
