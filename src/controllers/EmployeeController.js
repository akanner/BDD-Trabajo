/*
 * Controlador de los empleados
 *
 */
//REQUIRES------------------------------------------------------------------------------
//models
var Employee  = require('../models/employee');
var mongoose = require('mongoose');
//Logger
var MyLogClass = require('../utils/logger');

//helper de seguridad
var SecurityHelper = require('../utils/securityHelper');

//esquema de validaciones de express-validations
var empValidationsSchema = require("./validations/employeeSchema");
var util = require('util');
//end requires---------------------------------------------------------------------------
var logger = new MyLogClass("employeeControllerLogger");
var security = new SecurityHelper();
//usamos las promesas incluidas en ES6, las promesas de mongoDB estan deprecadas!!
mongoose.Promise = global.Promise;

//VERBOS

//GET - Retorna todos los empleados de la base de datos
exports.findAllEmployees = function(req, res) {  
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
	//verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return res.status(412).json({message: "Id inválido"});
    }

    Employee.findById(validId, function(err, emp) {
    //si hay un error se loguea la excepcion y se informa al usuario
    if(err)
    {
    	logger.error("error obteniendo al empleado con ID: " + validId);
    	logger.error(err.message);
    	return res.status(500).json(err.message);
    }
    //si no hay errores se devuelve al usuario consultado 
    res.status(200).json(emp);
    });
};

//POST - Inserta un nuevo empleado en la base de datos
exports.addEmployee = function(req, res) {  
    //valida el requerimiento
    req.check(empValidationsSchema);
    //getValidationResult devuelve una promesa
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) 
        {
          //si hay algun error se le informa al usuario
          res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
        }
        else
        {
            //si no hay errores se crea el nuevo empleado
            createEmployee(req,res)
        }

    });
};


//FIN VERBOS


/**
 * Crea el empleado nuevo y devuelve la respuesta al usuario
 * 
 * @param req Objeto Request
 * @param res Objeto Response
 */
function createEmployee(req,res)
{
    //si el requerimiento es valido crea el nuevo empleado
    var emp = new Employee({
        title:    req.body.title,
        ename:     req.body.ename,
    });
    //trata de guardar al empleado recien creado
    emp.save(function(err, emp) {
        if(err) 
        {
            //si hay algun error se loguea la excepcion y se informa al usuario
            logger.error("no se pudo guardar el empleado: " + JSON.stringify(emp));
            res.status(500).send( err.message);
            return; 
        }
    //si sale todo ok se le envia el nuevo empleado al usuario
    res.status(200).json(emp);
    });
}