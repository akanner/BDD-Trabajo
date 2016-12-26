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
var logger = new MyLogClass();
var security = new SecurityHelper();
//formateo de respuestas
var responseFormatter = require('../utils/responseFormatter');
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
	    	responseFormatter.send500Response(res,err.message);
	    } 
	    else
    	{
    		//si no hay errores se devuelve la coleccion de empleados al usuario
    		responseFormatter.send200Response(res,emp);
    	}
	        
    });
};

//GET - Retorna a un empleado con el id especificado
exports.findById = function(req, res) {
	//verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return responseFormatter.send412Response(res,"Invalid id");
    }

    Employee.findById(validId, function(err, emp) {
    //si hay un error se loguea la excepcion y se informa al usuario
    if(err)
    {
    	logger.error("error obteniendo al empleado con ID: " + validId);
    	logger.error(err.message);
    	responseFormatter.send500Response(res,err.message);
        return;
    }
    if(!emp)
    {
        responseFormatter.send404Response(res,"there is no employee with id: " + req.params.id);
        return;
    }
    //si no hay errores se devuelve al usuario consultado 
    responseFormatter.send200Response(res,emp);
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
          responseFormatter.send404Response(res,'There have been validation errors: ' + util.inspect(result.array()));
        }
        else
        {
            //si no hay errores se crea el nuevo empleado
            createEmployee(req,res)
        }

    });
};



//PUT - Actualiza un empleado
exports.updateEmployee = function(req, res) {  

     //valida el requerimiento
    req.check(empValidationsSchema);
    //verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return responseFormatter.send412Response(res,"Invalid id");
    }
     //getValidationResult devuelve una promesa
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) 
        {
          //si hay algun error se le informa al usuario
          responseFormatter.send400Response(res,'There have been validation errors: ' + util.inspect(result.array()));
        }
        else
        {
            //si no hay errores se crea el nuevo empleado
            updateEmployee(req,res)
        }
    });
};




//DELETE - Elimina un empleado de la base de datos
exports.deleteEmployee = function(req, res) {  
     //valida el requerimiento
    req.check(empValidationsSchema);
    //verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return responseFormatter.send412Response(res,"Invalid id");
    }
    Employee.findById(req.params.id, function(err, emp) {
        if(err)
        {
             //si hay algun error se le informa al usuario
            logger.error("no se pudo encontrar al empleado con id " + req.params.id + " : " + err);
            responseFormatter.send500Response(res,err.message);
            return;
        }
        if(!emp)
        {
            //si no existe el empleado
            responseFormatter.send404Response(res,"there is no employee with id: " + req.params.id);
            return;
        }
        //intenta borrar al empleado
        removeEmployeeAndWriteResponse(emp,res);
       
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
    saveEmployeeAndWriteResponse(emp,res);

}
/**
 * Actualiza un empleado en la base de datos
 *
 * @param req   Objeto HTTP Request
 * @param res   Objeto HTTP Response
 *
 */
function updateEmployee(req,res)
{
     //busca el empleado en la base de datos
     var emp = Employee.findById(req.params.id,function(err,emp){
         if(err)
         {
            //si hay algun error se le informa al usuario
            logger.error("no se pudo encontrar al empleado con id " + req.params.id + " : " + err);
            responseFormatter.send500Response(res,err.message);
            return;
         }
         if(!emp)
         {
            responseFormatter.send404Response(res,"there is no employee with id: " + req.params.id);
            return;
         }
         emp.title = security.cleanup(req.body.title);
         emp.ename = security.cleanup(req.body.ename);

         //guarda los cambios
        saveEmployeeAndWriteResponse(emp,res);


         
     });
    

}
/**
 * Guarda el usuario en la base de datos y escribe en la respuesta
 *
 * TODO: buscar una mejor manera de hacer esto, este metodo no deberia escribir la respuesta
 *
 * @param emp   Entidad Employee a guardar
 *
 */
function saveEmployeeAndWriteResponse(emp,res)
{
    emp.save(function(err, emp) {
        if(err) 
        {
            logger.error("no se pudo guardar el empleado: " + JSON.stringify(emp));
            logger.error(err.message);
            responseFormatter.send500Response(res,err.message);
        }
        else
        {
            //si sale todo ok se le envia el nuevo empleado al usuario
            responseFormatter.send200Response(res,emp);
        }
    });
}
/**
 * Elimina el empleado de la base de datos
 *
 * TODO: buscar una mejor manera de hacer esto, este metodo no deberia escribir la respuesta
 *
 * @param emp   Entidad Employee a eliminar
 *
 */
function removeEmployeeAndWriteResponse(emp,res)
{
     emp.remove(function(err) {
        if(err) 
        {
            logger.error("no se pudo eliminar el empleado: " + JSON.stringify(emp));
            logger.error(err.message);
            responseFormatter.send500Response(res,err.message);
        }
        else
        {
            //si sale todo ok se le envia el nuevo empleado al usuario
            responseFormatter.send200Response(res,emp);
        }
     });

}