var express = require('express');
var router = express.Router();

// Initial dummy route for testing
router.get('/', function (req, res) {
    res.json({message: 'App Working!'});
});

module.exports = router;