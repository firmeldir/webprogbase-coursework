const express = require('express');
const router = express.Router();
const User = require('../models/user');
const createError = require('http-errors');


/* GET users listing. */
router.get('/', function(req, res) {
    let users = User.getAll();

    res.format({  
        json: function () {
          res.send(users);
        }
      });
});

router.get('/:id', function(req, res, next) {
  let user = User.getById(req.params.id);

  if(user){

    res.format({  
        json: function () {
          res.send(user);
        }
      });
  }else{
    next(createError(404));
  }
});

module.exports = router;  
