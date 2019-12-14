const express = require('express');
const router = express.Router();
const Checker = require('../permission_checker');


router.get('/', function(req, res) {
  res.render('about', { auth: Checker.authData(req) });
});

module.exports = router;
