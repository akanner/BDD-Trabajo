var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');
var bodyParser = require('body-parser');
//Logger
var myLogClass = require('./utils/logger');
var logger = new myLogClass();


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


//crea el string de conexion de mongoDBs
var urlMongoose = config.Mongo.client + "://" + config.Mongo.host + ":" + config.Mongo.port + "/" + config.Mongo.dbName;
//trata de conectarse a la base de datos, si hay un error, logger loguea la excepcion y la aplicacion devuelve el error
mongoose.connect(urlMongoose, function (err) {
    if (err) 
    	{
    		logger.fatal("Cannot stablish connection with DB, Exception: " + err.message);
    		throw err;
    	}
});
//define el puerto a utilizar segun configuracion, si tal configuracion no existe utiliza el puerto 8000
var port = process.env.PORT || 8000;

//registra las rutas
var empsRoutes = require('./routes/employeesRoutes');
var indexRoute = require("./routes/indexRoutes");
app.use('/api',indexRoute)
app.use('/api/employee', empsRoutes);
// Start server
app.listen(port, function() {
  console.log("Node server running on http://localhost:" + port);
});