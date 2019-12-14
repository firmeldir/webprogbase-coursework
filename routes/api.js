const express = require('express');
const router = express.Router();
const Checker = require('../api_checker');
const User = require('../models/user');
const Task = require('../models/task');
const Subject = require('../models/subject');
const Teacher = require('../models/teacher');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const multer = require('multer');

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

const upload = multer({ storage: storage });

router.get('/', Checker.checkAuth, function (req, res) {
    res.format({
        json: function () {
            res.send(
                { "json": "obj" }
            );
        }
    });
});

//**USER */

router.route('/unique/:login').get(function (req, res) {

    User.findOne({ login: req.params.login })
        .then(user => {

            if (user) {
                res.json({ "message": "User exist!" });
            } else {
                res.json({ "message": 'Unique' });
            }
        })
        .catch(err => { res.status(500).send(err.toString()); });
});

router.route('/me').get(function (req, res) {
    let user = req.user;

    if (!user) {
        res.sendStatus(401);
    } else {
        res.json(user);
    }
});

router.route('/users')

    .post(Checker.checkAdmin, function (req, res) {

        let login = req.body.login;
        let fullname = req.body.fullname;
        let pass = req.body.pass;

        User.findOne({ login: login })
            .then(user => {

                if (user) {
                    res.status(400).json({ message: 'Login already exists' });
                } else {

                    bcrypt.hash(pass, saltRounds, function (err, hash) {
                        let user = {
                            login: login,
                            passwordHash: hash,
                            fullname: fullname
                        };

                        User(user).save()
                            .then(() => res.json({ message: 'User created!' }))
                            .catch(err => { res.send(err); });
                    });
                }
            })
            .catch(err => { res.send(err); });
    })

    .get(Checker.checkAdmin, function (req, res) {

        let searchQuery = req.query.searchQuery;
        let page = req.query.page;
        let limit = req.query.limit;

        if (typeof searchQuery === 'undefined') searchQuery = "";
        if (typeof page === 'undefined') page = 1;
        if (typeof limit === 'undefined') { limit = 2; }
        else { limit = parseInt(req.query.limit); }

        let offset = (page - 1) * limit;

        const tasksPromise = User.find(
            { "login": { "$regex": searchQuery, "$options": "i" } }
        ).skip(offset).limit(limit);

        Promise.all([tasksPromise])
            .then(users => {
                res.json(users);
            })
            .catch(err => { res.send(err); });
    });


router.route('/users/:id')

    .get(Checker.checkAdmin, function (req, res) {
        User.findById(req.params.id)
            .then(user => {
                if (user) {
                    res.json({ message: user });
                } else {
                    res.status(404).json({ message: 'User not found!' });
                }
            })
            .catch(err => { res.send(err); });
    })

    .put(Checker.checkAdmin, function (req, res) {

        User.findById(req.params.id)
            .then(user => {
                if (user) {

                    if (req.body.fullname) { user.fullname = req.body.fullname; }

                    user.save();

                } else {
                    res.status(404).json({ message: 'User not found!' });
                }
            })
            .then(() => res.json({ message: 'User updated!' }))
            .catch(err => { res.send(err); });
    })

    .delete(Checker.checkAdmin, function (req, res) {
        User.remove({
            _id: req.params.id
        })
            .then(() => res.json({ message: 'Successfully deleted!' }))
            .catch(err => { res.send(err); });
    });


//**TASK */  checkAuth

router.route('/tasks')

    .post(Checker.checkAuth, upload.single('taskFile'), function (req, res) {

        let file = req.file;
        let body = req.body;

        if (!file) {

            let task = {
                name: req.body.title,
                taskText: body.description,
                additionText: body.addition,
                maxScore: parseInt(body.maxScore),
            };

            Task(task).save()
                .then(() => res.json({ message: 'Task created!' }))
                .catch(err => { res.send(err); });

        } else {

            let task = {
                name: req.body.title,
                taskText: body.description,
                additionText: body.addition,
                maxScore: parseInt(body.maxScore),
                taskFile: file.url
            };

            Task(task).save()
                .then(() => res.json({ message: 'Task created!' }))
                .catch(err => { res.send(err); });
        }
    })

    .get(Checker.checkAuth, function (req, res) {

        let searchQuery = req.query.searchQuery;
        let page = req.query.page;
        let limit = req.query.limit;

        if (typeof searchQuery === 'undefined') searchQuery = "";
        if (typeof page === 'undefined') page = 1;
        if (typeof limit === 'undefined') { limit = 4; }
        else { limit = parseInt(req.query.limit); }

        let offset = (page - 1) * limit;

        const tasksPromise = Task.find(
            { "name": { "$regex": searchQuery, "$options": "i" } }
        ).skip(offset).limit(limit);

        const countPromise = Task.countDocuments({ "name": { "$regex": searchQuery, "$options": "i" } });

        Promise.all([tasksPromise, countPromise])
            .then(([tasks, count]) => {

                count = ((count - (count % limit)) / limit);

                let ofer = count % limit;
                if (ofer >= 0) { count += 1; }

                res.json({
                    tasks: tasks,
                    count: count
                });
            })
            .catch(err => { res.send(err); });
    });


router.route('/tasks/:id')

    .get(Checker.checkAuth, function (req, res) {
        Task.findById(req.params.id)
            .then(task => {
                if (task) {
                    res.json({ message: task });
                } else {
                    res.status(404).json({ message: 'Task not found!' });
                }
            })
            .catch(err => { res.send(err); });
    })

    .put(Checker.checkAuth, function (req, res) {

        Task.findById(req.params.id)
            .then(task => {
                if (task) {

                    if (req.body.taskText) { task.taskText = req.body.taskText; }
                    if (req.body.additionText) { task.additionText = req.body.additionText; }
                    if (req.body.maxScore) { task.maxScore = req.body.maxScore; }
                    if (req.body.name) { task.name = req.body.name; }

                    task.save();

                } else {
                    res.status(404).json({ message: 'Task not found!' });
                }
            })
            .then(() => res.json({ message: 'Task updated!' }))
            .catch(err => { res.send(err); });
    })

    .delete(Checker.checkAuth, function (req, res) {

        Task.findById(req.params.id)
            .then(task => {
                if (task) {
                    return task.id;
                } else {
                    res.status(404).json({ message: 'Task not found!' });
                }
            })
            .then(id => {
                Task.remove({ _id: id })
                    .then(() => res.json({ message: 'Successfully deleted!' }))
                    .catch(err => { res.status(500).send(err); });
            });
    });



//**SUBJECT */  checkAuth

router.route('/subjects')

    .post(Checker.checkAuth, function (req, res) {

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
                        if (err) res.status(500).send(err);
                    });

                return subject;
            })
            .then(() => res.json({ message: 'Subject created!' }))
            .catch(err => { res.status(500).send(err); });
    })

    .get(Checker.checkAuth, function (req, res) {

        let searchQuery = req.query.searchQuery;
        let page = req.query.page;
        let limit = req.query.limit;

        if (typeof searchQuery === 'undefined') searchQuery = "";
        if (typeof page === 'undefined') page = 1;
        if (typeof limit === 'undefined') { limit = 2; }
        else { limit = parseInt(req.query.limit); }

        let offset = (page - 1) * limit;

        const tasksPromise = Subject.find(
            { "name": { "$regex": searchQuery, "$options": "i" } }
        ).skip(offset).limit(limit);

        Promise.all([tasksPromise])
            .then(subjects => {
                res.json(subjects);
            })
            .catch(err => { res.send(err); });
    });


router.route('/subjects/:id')

    .get(Checker.checkAuth, function (req, res) {
        Subject.findById(req.params.id)
            .then(subject => {
                if (subject) {
                    res.json({ message: subject });
                } else {
                    res.status(404).json({ message: 'Subject not found!' });
                }
            })
            .catch(err => { res.send(err); });
    })

    .put(Checker.checkAuth, function (req, res) {

        Subject.findById(req.params.id)
            .then(subject => {
                if (subject) {

                    if (req.body.name) { subject.name = req.body.name; }
                    if (req.body.description) { subject.description = req.body.description; }
                    if (req.body.price) { subject.price = req.body.price; }

                    subject.save();

                } else {
                    res.status(404).json({ message: 'Subject not found!' });
                }
            })
            .then(() => res.json({ message: 'Subject updated!' }))
            .catch(err => { res.send(err); });
    })

    .delete(Checker.checkAuth, function (req, res) {

        Subject.remove({ _id: req.params.id })
            .then(() => {

                Teacher.findOneAndUpdate(req.user.teacherData,
                    { $pull: { subjects: { $in: req.params.id } } }, { multi: true },
                    function (err) {
                        if (err) res.send(err);
                    });
            })
            .then(() => res.json({ message: 'Successfully deleted!' }))
            .catch(err => { res.send(err); });
    });





module.exports = router;  
