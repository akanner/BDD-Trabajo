//Guarda un log en la base de datos por cada requerimiento realizado
var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;
//Logger
var MyLogClass = require('../utils/logger'),
    logger = new MyLogClass();
var logSchema = new Schema({
  remoteAddr : String, 
  method: String,
  url: String,
  requestBody: String,
  statusCode: Number,
  totalTimeMs: Number,
  responseLengthBytes : Number
});

var Log = mongoose.model('Log', logSchema); 


module.exports =  function(req, res, next) {
    //funcion que se ejecuta luedo de terminar el requerimiento
    function logRequest() {
      //elimina los listeners para evitar llamadas dobles
      res.removeListener('finish', logRequest);
      res.removeListener('close', logRequest);
      //action after request

      //crea una entidad de log nueva
      var newLog = new Log({
        remoteAddr: req.ip,
      	method: req.method,
      	url: req.originalUrl,
      	requestBody: JSON.stringify(req.body),
      	statusCode: res.statusCode,
      	totalTimeMs: new Date - req._startTime,
      	responseLengthBytes: res.get('content-length')
      });
      newLog.save(function(err,log){
      	var outStr = JSON.stringify(newLog);
      	if(err){
      		logger.error("error saving log: " + outStr + ",error: " + err);
      	}

        console.log(newLog.remoteAddr + ' ' + newLog.method + ' ' + newLog.url + ' ' + newLog.statusCode + ' ' + newLog.responseLengthBytes + ' ' + newLog.totalTimeMs + 'ms');

      	
      });
    }
    //escucha los eventos finish y close
    res.on('finish', logRequest);
    res.on('close', logRequest);

    // action before request
    req._startTime = new Date;
    // eventually calling `next()`
    next();
}


