const express = require('express');
const router = express.Router();
const path = require("path");

router.get('/:file', function(req, res, next) {
    console.log(__dirname);
  res.sendFile(path.resolve(__dirname + "/../data/fs/" + req.params.file));
  
});

module.exports = router;

