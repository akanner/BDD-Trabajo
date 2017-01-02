/*
 * Controlador de los empleados
 *
 */
//REQUIRES------------------------------------------------------------------------------
//models
var Project  = require('../models/project');
var mongoose = require('mongoose');
//Logger
var MyLogClass = require('../utils/logger');
//controlador generico
var genericController = require('./genericController');
//helper de seguridad
var SecurityHelper = require('../utils/securityHelper');

//esquema de validaciones de express-validations
var projValidationsSchema = require("./validations/projectSchema");
var util = require('util');
//end requires---------------------------------------------------------------------------
var logger = new MyLogClass();
var security = new SecurityHelper();
//formateo de respuestas
var responseFormatter = require('../utils/responseFormatter');
//usamos las promesas incluidas en ES6, las promesas de mongoDB estan deprecadas!!
mongoose.Promise = global.Promise;

//Constantes
var INVALID_ID = "Invalid id";

//GET - Retorna todos los proyectos de la base de datos
exports.findAllProjects = function(req, res) {  
    genericController.getAllEntities(Project,["assignments"],res,function(err,res){
        logger.error("error obteniendo los proyectos de la base de datos");
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(res,proj){
        //si no hay errores se devuelve la coleccion de proyectos al usuario
        responseFormatter.send200Response(res,proj);
    });
};

//GET - Retorna un proyecto con el id especificado
exports.findById = function(req, res) {
    //verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return responseFormatter.send412Response(res,INVALID_ID);
    }
    else
    {
        //si el id es valido busca en la base de datos un proyecto con ese id
        return getProjectAndProcessResult(validId,res,function(res,proj){
            responseFormatter.send200Response(res,proj);
        })
    }

};

//POST - Inserta un nuevo proyecto en la base de datos
exports.addProject = function(req, res) {  
    //valida el requerimiento
    req.check(projValidationsSchema);
    //getValidationResult devuelve una promesa
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) 
        {
          //si hay algun error se le informa al usuario
          responseFormatter.send404Response(res,'There have been validation errors: ' + util.inspect(result.array()));
        }
        else
        {
            //si no hay errores se crea el nuevo proyecto
            createProject(req,res)
        }

    });
};

//PUT - Actualiza un proyecto
exports.updateProject = function(req, res) {  

     //valida el requerimiento
    req.check(projValidationsSchema);
    //verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return responseFormatter.send412Response(res,INVALID_ID);
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
            //si no hay errores se actualiza el proyecto
            amendProject(req,res);
        }
    });
};

//DELETE - Elimina un proyecto de la base de datos
exports.deleteProject = function(req, res) {  
     //valida el requerimiento
    req.check(projValidationsSchema);
    //verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return responseFormatter.send412Response(res,INVALID_ID);
    }
    else
    {
    	return removeProject(req,res);
    }
};


//FIN VERBOS


/**
 * Crea el proyecto nuevo y devuelve la respuesta al usuario
 * 
 * @param req Objeto Request
 * @param res Objeto Response
 */
function createProject(req,res)
{
    //si el requerimiento es valido crea el nuevo proyecto
    var proj = new Project({
        pname:    security.cleanup(req.body.pname),
        budget:   security.cleanup(req.body.budget),
    });
    //trata de guardar al proyecto recien creado
    saveProjectAndWriteResponse(proj,res);

}

/**
 * Actualiza un proyecto en la base de datos
 *
 * @param req   Objeto HTTP Request
 * @param res   Objeto HTTP Response
 *
 */
function amendProject(req,res)
{
     //busca el project en la base de datos
     getProjectAndProcessResult(req.params.id,res,function(res,proj){
         proj.pname = security.cleanup(req.body.pname);
         proj.budget = security.cleanup(req.body.budget);

         //guarda los cambios
        saveProjectAndWriteResponse(proj,res);

     });
}
/**
 * elimina un proyecto de la base de datos
 *
 * @param req   Objeto HTTP Request
 * @param res   Objeto HTTP Response
 */
function removeProject(req,res)
{
 return getProjectAndProcessResult(req.params.id,res,function(res,proj){
            //intenta borrar al proyecto
            removeProjectAndWriteResponse(proj,res);
        });
}

/**
 * Guarda el proyecto en la base de datos y escribe en la respuesta
 *
 * TODO: buscar una mejor manera de hacer esto, este metodo no deberia escribir la respuesta
 *
 * @param proj   Entidad Project a guardar
 *
 */
function saveProjectAndWriteResponse(proj,res)
{
   genericController.saveEntityAndWriteResponse(proj,res,function(err,proj,res){
    logger.error("no se pudo guardar el proyecto: " + proj);
    logger.error(err.message);
    responseFormatter.send500Response(res,err.message);
   },function(proj,res){
     //si sale todo ok se le envia el nuevo proyecto al usuario
    responseFormatter.send200Response(res,proj);
   });
}

/**
 * Elimina a un proyecto de la base de datos
 *
 * TODO: buscar una mejor manera de hacer esto, este metodo no deberia escribir la respuesta
 *
 * @param emp   Entidad Project a eliminar
 *
 */
function removeProjectAndWriteResponse(proj,res)
{
    genericController.removeEntityAndWriteResponse(proj,res,function(err,proj,res){
        logger.error("no se pudo eliminar el proyecto: " + proj);
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(proj,res){
        //si sale todo ok se le envia el proyecto eliminado al usuario
        responseFormatter.send200Response(res,proj);
    });
}

/**
 * Intenta encontrar un projecto buscando por su id, en caso de encontrarlo, se llama a la funcion callbalk pasada por parametro
 *
 * @param ID        Id del proyecto
 * @param res       objeto respuesta HTTP
 * @param callbalk  funcion callbalk para procesar el proyecto encontrado, dicha funcion recive 2 parametros, callback(res,proj) siendo res el objeto respuesta http y proj el proyecto encontrado en la base de datos
 *
 */  
function getProjectAndProcessResult(id,res,callback)
{
    genericController.getEntityAndProcessResult(Project,id,null,res,errorFindingAProjectWithId,projectNotFound,function(proj,res){
        //si no hay errores se devuelve al proyecto consultado 
        callback(res,proj);
     });
}
/**
 * funcion utilizada como errorCallback del metodo getEntityAndProcessResult de genericController
 *
 */ 
function errorFindingAProjectWithId(error,id,res)
{
    logger.error("error obteniendo al proyecto con ID: " + id);
    logger.error(err.message);
    responseFormatter.send500Response(res,err.message);
}
/**
 * funcion utilizada como entityNotFoundCallback del metodo getEntityAndProcessResult de genericController
 *
 */
function projectNotFound(id,res)
{
    responseFormatter.send404Response(res,"there is no project with id: " + id);
}