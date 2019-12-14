const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const createError = require('http-errors');
const Checker = require('../permission_checker');
const multer  = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dhfsqq753',
    api_key: '381175354753275',
    api_secret: '4WoTnMvYqIEMIt_CagLxJBbyZ6s'
});

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "demo",
  allowedFormats: ["jpg", "png"]
});

const upload = multer({storage: storage});



router.get('/new/:id', Checker.checkAuth, function (req, res) {
  res.render('task_new', { id: req.params.id , auth: Checker.authData(req) });
});

router.get('/new', Checker.checkAuth, function (req, res) {
  res.render('task_new', { auth: Checker.authData(req) });
});

router.post('/new/:id', Checker.checkAuth, upload.single('taskFile'), (req, res) => {

  let file = req.file;
  let body = req.body;

  let task;

  if (!file) {
    task = {
      name: req.body.title,
      taskText: body.description,
      additionText: body.addition,
      maxScore: parseInt(body.maxScore),
      subject: req.params.id
    };
  } else {
    task = {
      name: req.body.title,
      taskText: body.description,
      additionText: body.addition,
      maxScore: parseInt(body.maxScore),
      taskFile: file.url,
      subject: req.params.id
    };
  }

  Task(task).save()
      .then(task => {
        res.redirect('/tasks/' + task.id);
      })
      .catch(err => { res.status(500).send(err.toString()); });
});

router.post('/new', Checker.checkAuth, upload.single('taskFile'), (req, res) => {

  let file = req.file;
  let body = req.body;

  let task;

  if (!file) {
    task = {
      name: req.body.title,
      taskText: body.description,
      additionText: body.addition,
      maxScore: parseInt(body.maxScore),
    };
  } else {
    task = {
      name: req.body.title,
      taskText: body.description,
      additionText: body.addition,
      maxScore: parseInt(body.maxScore),
      taskFile: file.url
    };
  }

  Task(task).save()
      .then(task => {
        res.redirect('/tasks/' + task.id);
      })
      .catch(err => { res.status(500).send(err.toString()); });
});





router.post('/:id', Checker.checkAuth, (req, res, next) => {
  Task.findById(req.params.id)
    .then(task => {
      if (task) {
        return task.id;
      } else {
        next(createError(404));
      }
    })
    .then(id =>{
      Task.remove({ _id: id })
        .then(() => { res.redirect('/tasks'); })
        .catch(err => { res.status(500).send(err.toString()); });
    });
});





router.get('/', Checker.checkAuth, function (req, res) {

  let searchQuery = req.query.searchQuery;
  let page = req.query.page;

  if (typeof searchQuery === 'undefined') searchQuery = "";
  if (typeof page === 'undefined') page = 1;

  let limit = 4;
  let offset = (page - 1) * limit;

  const tasksPromise = Task.find(
    { "name": { "$regex": searchQuery, "$options": "i" } }
  ).skip(offset).limit(limit);
  const numberTasksPromise = Task.countDocuments({ "name": { "$regex": searchQuery, "$options": "i" } });

  Promise.all([
    tasksPromise,
    numberTasksPromise 
  ])
  .then((values, count) => {
    let tasks = values[0];

    count = ((count - (count % limit)) / limit);

    let ofer = count % limit;
    if(ofer >= 0){ count += 1; }

    if (tasks.length === 0) {
      res.render('tasks', {
        emptySearchText: "We have not find anything for you",
        searchQuery: searchQuery,
        current: 0,
        maximum: count,
        auth: Checker.authData(req)
      });
    } else {
      res.render('tasks', {
        tasks: tasks,
        searchQuery: searchQuery,
        current: page,
        maximum: count,
        auth: Checker.authData(req)
      });
    }
  })
  .catch(err => { res.status(500).send(err.toString()); });
});

router.get('/:id', Checker.checkAuth, function (req, res) {

  if(req.params.id.length !== 24){
    res.sendStatus(404);
  }

  Task.findById(req.params.id)
    .then(task => {
      if (task) {
        res.render('task', { task: task, taskFile: task.taskFile, auth: Checker.authData(req) });
      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => { res.status(500).send(err.toString()); });
});



module.exports = router;  
