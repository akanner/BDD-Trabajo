var express = require('express');
var mongoose = require('mongoose');
var mongooseUrlHelper = require('./utils/mongoConnectionStringHelper');
var bodyParser = require('body-parser');
//Logger
var myLogClass = require('./utils/logger');
var requestLogger = require("./utils/requestLogMiddleware");
var logger = new myLogClass();




//express-validations
var expressValidator = require('express-validator');



//---------------------------------------------------------
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expressValidator()); // this line must be immediately after any of the bodyParser middlewares!

//logueo de requerimientos
app.use(requestLogger);


//crea el string de conexion de mongoDBs
var urlMongoose = mongooseUrlHelper.getMongoConnectionString();
var dbOptions = mongooseUrlHelper.getMongoConnectionOptions();
//trata de conectarse a la base de datos, si hay un error, logger loguea la excepcion y la aplicacion devuelve el error
mongoose.connect(urlMongoose,dbOptions, function (err) {
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
var projRoutes = require("./routes/projectsRoutes");
var asgRoutes = require("./routes/assignmentsRoutes");
var payRoutes = require('./routes/paymentsRoutes')
var indexRoute = require("./routes/indexRoutes");
app.use('/api',indexRoute)
app.use('/api/employee', empsRoutes);
app.use('/api/project', projRoutes);
app.use('/api/assignment', asgRoutes);
app.use('/api/payment',payRoutes);
// Start server
app.listen(port, function() {
  console.log("Node server running on http://localhost:" + port);
});