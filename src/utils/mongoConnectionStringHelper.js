/**
 * Obtiene la URL de conexion con el servidor de mongo
 *
 */

 var config = require('../config');

/**
 * parsea un array de hosts y devuelve un string con los hosts concatenados
 *
 * @param [object] hosts array de hosts a parsear. Ej: ["example-1.mongo.com:27017","example-2.mongo.com:27017"]
 *
 * @return string lista de hosts concatenada por "," ej: "example-1.mongo.com:27017,example-2.mongo.com:27017"
 */

function getDbHostsString(hosts){
	return hosts.join();
}


/**
 * Obtiene la url de conexion con el servidor de mongobd
 *
 */
 exports.getMongoConnectionString = function(){
 	var mongoUrl = config.Mongo.client + "://" + getDbHostsString(config.Mongo.hosts) + "/" + config.Mongo.dbName + "?replicaSet=" + config.Mongo.replicaSet;
 	return mongoUrl;
 }

 exports.getMongoConnectionOptions = function(){
 	options = {
 		"replSet" : {
 			"readPreference" : "nearest",
 			"connectWithNoPrimary" : true //read-only
 		}
 	}
 }