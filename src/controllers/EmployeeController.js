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
//controlador generico
var genericController = require('./genericController');
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
    //filtra los resultados
    var filters = genericController.filterQueryParameters(req.query,["ename","title"]);
    genericController.getAllEntities(Employee,filters,res,function(err,res){
        logger.error("error obteniendo a los empleados de la base de datos");
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(res,emp){
        //si no hay errores se devuelve la coleccion de empleados al usuario
        responseFormatter.send200Response(res,emp);
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
    getEmployeeAndProcessResult(validId,res,function(res,emp){
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
            amendEmployee(req,res)
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
    getEmployeeAndProcessResult(validId,res,function(res,emp){
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
        title:    security.cleanup(req.body.title),
        ename:    security.cleanup(req.body.ename)
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
function amendEmployee(req,res)
{
    getEmployeeAndProcessResult(req.params.id,res,function(res,emp){
        emp.title = security.cleanup(req.body.title);
        emp.ename = security.cleanup(req.body.ename);
        //guarda los cambios
        saveEmployeeAndWriteResponse(emp,res);
    });
}

/**
 * Obtiene un sueldo y llama a un callback para procesar los resultados
 *
 */
function getEmployeeAndProcessResult(id,res,callback)
{
    genericController.getEntityAndProcessResult(Employee,id,res,function(error,id,res){
        logger.error("error obteniendo al empleado con ID: " + id);
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(id,res){
         responseFormatter.send404Response(res,"there is no employee with id: " + id);
    },function(emp,res){
        //si no hay errores se devuelve al proyecto consultado 
        callback(res,emp);
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
    console.log(emp);
    genericController.saveEntityAndWriteResponse(emp,res,function(err,emp,res){
        logger.error("no se pudo guardar el empleado: " + emp);
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(emp,res){
        //si sale todo ok se le envia el nuevo empleado al usuario
        responseFormatter.send200Response(res,emp);
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
    genericController.removeEntityAndWriteResponse(emp,res,function(err,emp,res){
        logger.error("no se pudo eliminar el empleado: " + emp);
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(emp,res){
        //si sale todo ok se le envia el nuevo empleado al usuario
        responseFormatter.send200Response(res,emp);
    });
}