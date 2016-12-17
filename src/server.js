var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');
var bodyParser = require('body-parser');
//Logger
var myLogClass = require('./utils/logger');
var logger = new myLogClass();


var app = express(); //Create the Express app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));



var urlMongoose = config.Mongo.client + "://" + config.Mongo.host + ":" + config.Mongo.port + "/" + config.Mongo.dbName;

mongoose.connect(urlMongoose, function (err) {
    if (err) 
    	{
    		logger.fatal("Cannot stablish connection with DB, Exception: " + err.message);
    		throw err;
    	}
});

var port = process.env.PORT || 8000;


// Start server
app.listen(port, function() {
  console.log("Node server running on http://localhost:" + port);
});