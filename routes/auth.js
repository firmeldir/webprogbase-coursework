const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const createError = require('http-errors');


//**Router */

module.exports = function (app, passport) {

    router.get('/register', function (req, res) {

        let error = req.query.error;
        res.render('register', { auth: req.user, error: error });
    });

    router.get('/login', function (req, res) {
        let error = req.query.error;
        res.render('login', { auth: req.user, error: error });
    });


    router.post('/register',
        (req, res) => {
            let login = req.body.login;
            let fullname = req.body.fullname;
            let pass = req.body.pass;
            let pass2 = req.body.pass2;

            if (!(pass === pass2)) {
                res.redirect('/auth/register?error=' + encodeURIComponent('Passwords do not match'));
            }

            User.findOne({ login: login })
                .then(user => {

                    if (user) {
                        res.redirect('/auth/register?error=' + encodeURIComponent('Login already exists'));
                    } else {

                        bcrypt.hash(pass, saltRounds, function (err, hash) {
                            let user = {
                                login: login,
                                passwordHash: hash,
                                fullname: fullname
                            };

                            User(user).save()
                                .then(() => res.redirect('/auth/login'))
                                .catch(err => { res.status(500).send(err.toString()); });
                        });
                    }
                })
                .catch(err => { res.status(500).send(err.toString()); });
        });

    router.post('/login', function (req, res, next) {

        User.findOne({ login: req.body.login })
            .then(user => {
                if (!user) {
                    res.redirect('/auth/login?error=' + encodeURIComponent('Login or password is entered incorrectly'));
                }
            })
            .catch(err => { res.status(500).send(err.toString()); });

        passport.authenticate('local', function (error, user) {

            if (error) { next(createError(error)); }
            if (!user) { return res.redirect('/auth/login?error=' + encodeURIComponent('Login or password is entered incorrectly')); }
            req.logIn(user, function (error) {
                if (error) { return next(createError(error)); }
                return res.redirect('/');
            });
        })(req, res, next);
    });

    router.get('/logout',
        (req, res) => {
            req.logout();
            res.redirect('/');
        });

    return { router };
};

