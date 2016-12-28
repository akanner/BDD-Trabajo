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
    assignment.find(function(err, asg) {
    	//en caso de error se loguea la excepcion y se devueve el error al usuario
	    if(err)
	    {
	    	logger.error("error obteniendo los asignaciones de la base de datos");
	    	logger.error(err.message);
	    	responseFormatter.send500Response(res,err.message);
	    } 
	    else
    	{
    		//si no hay errores se devuelve la coleccion de asignaciones al usuario
    		responseFormatter.send200Response(res,asg);
    	}
	        
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

    assignment.findById(validId, function(err, emp) {
    //si hay un error se loguea la excepcion y se informa al usuario
    if(err)
    {
    	logger.error("error obteniendo la asignacion con ID: " + validId);
    	logger.error(err.message);
    	responseFormatter.send500Response(res,err.message);
        return;
    }
    if(!emp)
    {
        responseFormatter.send404Response(res,"there is no assignment with id: " + req.params.id);
        return;
    }
    //si no hay errores se devuelve la asignacion consultado 
    responseFormatter.send200Response(res,emp);
    });
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
        emp_id:    security.cleanup(req.body.emp_id),
        proj_id:   security.cleanup(req.body.proj_id),
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
     //busca la Assignment en la base de datos
     var asg = assignment.findById(req.params.id,function(err,asg){
         if(err)
         {
            //si hay algun error se le informa al usuario
            logger.error("no se pudo encontrar la asignacion con id " + req.params.id + " : " + err);
            responseFormatter.send500Response(res,err.message);
            return;
         }
         if(!asg)
         {
            responseFormatter.send404Response(res,"there is no assignment with id: " + req.params.id);
            return;
         }
         asg.emp_id = security.cleanup(req.body.emp_id);
         asg.proj_id = security.cleanup(req.body.proj_id);
         asg.responsibilities = security.cleanup(req.body.responsibilities),
         asg.duration = security.cleanup(req.body.duration)
         //guarda los cambios
        saveAssignmentAndWriteResponse(asg,res);


         
     });
    

}

function removeAssignment(req,res)
{
 assignment.findById(req.params.id, function(err, asg) {
    if(err)
    {
         //si hay algun error se le informa al usuario
        logger.error("no se pudo encontrar la asignacion con id " + req.params.id + " : " + err);
        responseFormatter.send500Response(res,err.message);
        return;
    }
    if(!asg)
    {
        //si no existe la asignacion
        responseFormatter.send404Response(res,"there is no assignment with id: " + req.params.id);
        return;
    }
    //intenta borrar a la asignacion
    removeAssignmentAndWriteResponse(asg,res);
   
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
    asg.save(function(err, asg) {
        if(err) 
        {
            logger.error("no se pudo guardar al asignacion: " + JSON.stringify(asg));
            logger.error(err.message);
            responseFormatter.send500Response(res,err.message);
        }
        else
        {
            //si sale todo ok se le envia la nueva asignacion al usuario
            responseFormatter.send200Response(res,asg);
        }
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
     asg.remove(function(err) {
        if(err) 
        {
            logger.error("no se pudo eliminar la asignacion: " + JSON.stringify(asg));
            logger.error(err.message);
            responseFormatter.send500Response(res,err.message);
        }
        else
        {
            //si sale todo ok se le envia el nuevo asignacion al usuario
            responseFormatter.send200Response(res,asg);
        }
     });

}