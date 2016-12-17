/*
 * Controlador de los empleados
 *
 */

var Employee  = require('../models/employee');

//Logger
var MyLogClass = require('../utils/logger');
var logger = new MyLogClass("employeeControllerLogger");
//helper de seguridad
var SecurityHelper = require('../utils/securityHelper');
var security = new SecurityHelper();

//GET - Retorna todos los empleados de la base de datos
exports.findAllEmployees = function(req, res) {  
    console.log('GET /employees');
    Employee.find(function(err, emp) {
    	//en caso de error se loguea la excepcion y se devueve el error al usuario
	    if(err)
	    {
	    	logger.error("error obteniendo a los empleados de la base de datos");
	    	logger.error(err.message);
	    	res.send(500, err.message);
	    } 
	    else
    	{
    		//si no hay errores se devuelve la coleccion de empleados al usuario
    		res.status(200).json(emp);
    	}
	        
    });
};

//GET - Retorna a un empleado con el id especificado
exports.findById = function(req, res) {
    console.log('GET /api/employee/' + req.params.id);
	//verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return res.,status(412).json({message: "Id inválido"});
    }

    Employee.findById(validId, function(err, emp) {
    //si hay un error se loguea la excepcion y se informa al usuario
    if(err)
    {
    	logger.error("error obteniendo al empleado con ID: " + validId);
    	logger.error(err.message);
    	return res.send(500, err.message);
    }
    //si no hay errores se devuelve al usuario consultado 
    res.status(200).json(emp);
    });
};



