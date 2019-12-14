const express = require('express');
const router = express.Router();
const Checker = require('../permission_checker');


/* GET home page. */
router.get('/',
(req, res) => res.render('index', { auth: Checker.authData(req) }));



module.exports = router;

