/*
 * Controlador de las asignaciones
 *
 */
//REQUIRES------------------------------------------------------------------------------
//models
var assignment  = require('../models/assignment');
var mongoose = require('mongoose');
//Logger
var MyLogClass = require('../utils/logger');

//helper de seguridad
var SecurityHelper = require('../utils/securityHelper');
//controlador generico
var genericController = require('./genericController');
//esquema de validaciones de express-validations
var asgValidationsSchema = require("./validations/assignmentSchema");
var util = require('util');
//end requires---------------------------------------------------------------------------
var logger = new MyLogClass();
var security = new SecurityHelper();
//formateo de respuestas
var responseFormatter = require('../utils/responseFormatter');
//usamos las promesas incluidas en ES6, las promesas de mongoDB estan deprecadas!!
mongoose.Promise = global.Promise;

//GET - Retorna las asignaciones de un determinado proyecto
exports.findAllAssignments = function(req, res) {
    //obtiene los parametros para filtrar la query
    var filters = genericController.filterQueryParameters(req.query,["responsibilities","duration","employee","project"]);
    genericController.getAllEntities(assignment,filters,res,function(err,res){
        logger.error("error obteniendo los asignaciones de la base de datos");
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(res,asg){
        //si no hay errores se devuelve la coleccion de asignaciones al usuario
        responseFormatter.send200Response(res,asg);
    });  
};

//GET - Retorna una asignacion con el id especificado
exports.findById = function(req, res) {
	//verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return responseFormatter.send412Response(res,"Invalid id");
    }
    else
    {
        //si el id es valido busca en la base de datos una asignacion con ese id
        return getAssignmentAndProcessResult(validId,res,function(res,asg){
            responseFormatter.send200Response(res,asg);
        })
    }
};

//POST - Inserta una nueva asignacion en la base de datos
exports.addAssignment = function(req, res) {  
    //valida el requerimiento
    req.check(asgValidationsSchema);
    //getValidationResult devuelve una promesa
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) 
        {
          //si hay algun error se le informa al usuario
          responseFormatter.send404Response(res,'There have been validation errors: ' + util.inspect(result.array()));
        }
        else
        {
            //si no hay errores se crea el nuevo asignacion
            createAssignment(req,res)
        }

    });
};

//PUT - Actualiza una asignacion
exports.updateAssignment = function(req, res) {  

     //valida el requerimiento
    req.check(asgValidationsSchema);
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
            //si no hay errores se crea el nuevo asignacion
            amendAssignment(req,res);
        }
    });
};

//DELETE - Elimina una asignacion de la base de datos
exports.deleteAssignment = function(req, res) {  
     //valida el requerimiento
    req.check(asgValidationsSchema);
    //verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return responseFormatter.send412Response(res,"Invalid id");
    }
    else
    {
    	return removeAssignment(req,res);
    }
};


//FIN VERBOS


/**
 * Crea una asignacion nueva y devuelve la respuesta al usuario
 * 
 * @param req Objeto Request
 * @param res Objeto Response
 */
function createAssignment(req,res)
{
    //si el requerimiento es valido crea la nueva asignacion
    var asg = new assignment({
        employee:    security.cleanup(req.body.employee),
        project:   security.cleanup(req.body.project),
        responsibilities: security.cleanup(req.body.responsibilities),
        duration : security.cleanup(req.body.duration)
    });
    //trata de guardar al asignacion recien creado
    saveAssignmentAndWriteResponse(asg,res);

}

/**
 * Actualiza una asignacion en la base de datos
 *
 * @param req   Objeto HTTP Request
 * @param res   Objeto HTTP Response
 *
 */
function amendAssignment(req,res)
{
    getAssignmentAndProcessResult(req.params.id,res,function(res,asg){
         asg.employee = security.cleanup(req.body.employee);
         asg.project = security.cleanup(req.body.project);
         asg.responsibilities = security.cleanup(req.body.responsibilities),
         asg.duration = security.cleanup(req.body.duration)
         //guarda los cambios
        saveAssignmentAndWriteResponse(asg,res);
    });
}

function removeAssignment(req,res)
{
    getAssignmentAndProcessResult(req.params.id,res,function(res,asg){
        removeAssignmentAndWriteResponse(asg,res);
    });
}
/**
 * Obtiene una asignacion y llama a un callback para procesar los resultados
 *
 */
function getAssignmentAndProcessResult(id,res,callback)
{
    genericController.getEntityAndProcessResult(assignment,id,res,function(error,id,res){
        logger.error("error obteniendo la asignacion con ID: " + validId);
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(id,res){
        responseFormatter.send404Response(res,"there is no assignment with id: " + id);
    },function(proj,res){
        //si no hay errores se devuelve al proyecto consultado 
        callback(res,proj);
     });
}

/**
 * Guarda la asignacion en la base de datos y escribe en la respuesta
 *
 * TODO: buscar una mejor manera de hacer esto, este metodo no deberia escribir la respuesta
 *
 * @param asg   Entidad assignment a guardar
 *
 */
function saveAssignmentAndWriteResponse(asg,res)
{
    genericController.saveEntityAndWriteResponse(asg,res,function(err,proj,res){
        logger.error("no se pudo guardar al asignacion: " + asg);
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(asg,res){
         //si sale todo ok se le envia la nueva asignacion al usuario
        responseFormatter.send200Response(res,asg);
    });
}

/**
 * Elimina una asignacion de la base de datos
 *
 * TODO: buscar una mejor manera de hacer esto, este metodo no deberia escribir la respuesta
 *
 * @param emp   Entidad assignment a eliminar
 *
 */
function removeAssignmentAndWriteResponse(asg,res)
{
    genericController.removeEntityAndWriteResponse(asg,res,function(err,asg,res){
        logger.error("no se pudo eliminar la asignacion: " + asg);
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(asg,res){
        //si sale todo ok se le envia el proyecto eliminado al usuario
        responseFormatter.send200Response(res,asg);
    });

}
