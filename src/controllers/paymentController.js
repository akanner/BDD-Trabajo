/*
 * Controlador de las entidades 'payment'
 *
 */
//REQUIRES------------------------------------------------------------------------------
//models
var Payment  = require('../models/payment');
var mongoose = require('mongoose');
//Logger
var MyLogClass = require('../utils/logger');

//helper de seguridad
var SecurityHelper = require('../utils/securityHelper');
//controlador generico
var genericController = require('./genericController');
//esquema de validaciones de express-validations
var payValidationsSchema = require("./validations/paymentSchema");
var util = require('util');
//end requires---------------------------------------------------------------------------
var logger = new MyLogClass();
var security = new SecurityHelper();
//formateo de respuestas
var responseFormatter = require('../utils/responseFormatter');
//usamos las promesas incluidas en ES6, las promesas de mongoDB estan deprecadas!!
mongoose.Promise = global.Promise;

//VERBOS

//GET - Retorna todos los payments de la base de datos
exports.findAllPayments = function(req, res) {
    //obtiene los parametros para filtrar la query
    var filters = genericController.filterQueryParameters(req.query,["title","salary"]);
    genericController.getAllEntities(Payment,filters,res,function(err,res){
        logger.error("error obteniendo a los sueldos de la base de datos");
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
        },function(res,pay){
            //si no hay errores se devuelve la coleccion de proyectos al usuario
            responseFormatter.send200Response(res,pay);
        });  
};

//GET - Retorna a un sueldo con el id especificado
exports.findById = function(req, res) {
	//verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return responseFormatter.send412Response(res,"Invalid id");
    }

    getPaymentAndProcessResult(validId,res,function(res,pay){
        //si no hay errores se devuelve al sueldo consultado 
        responseFormatter.send200Response(res,pay);
    });
};



//POST - Inserta un nuevo sueldo en la base de datos
exports.addPayment = function(req, res) {  
    //valida el requerimiento
    req.check(payValidationsSchema);
    //getValidationResult devuelve una promesa
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) 
        {
          //si hay algun error se le informa al usuario
          responseFormatter.send404Response(res,'There have been validation errors: ' + util.inspect(result.array()));
        }
        else
        {
            //si no hay errores se crea el nuevo sueldo
            createPayment(req,res)
        }

    });
};



//PUT - Actualiza un sueldo
exports.updatePayment = function(req, res) {  

     //valida el requerimiento
    req.check(payValidationsSchema);
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
            //si no hay errores se actualiza el sueldo
            updatePayment(req,res)
        }
    });
};




//DELETE - Elimina un sueldo de la base de datos
exports.deletePayment = function(req, res) {  
     //valida el requerimiento
    req.check(payValidationsSchema);
    //verfica que el id enviado sea un id valido  
    var validId = security.getValidId(req.params.id);
    if (validId == false) 
    {
        return responseFormatter.send412Response(res,"Invalid id");
    }
    getPaymentAndProcessResult(validId,res,function(res,pay){
        //intenta borrar al payment
        removePaymentAndWriteResponse(pay,res);
    });
};


//FIN VERBOS


/**
 * Crea el sueldo nuevo y devuelve la respuesta al usuario
 * 
 * @param req Objeto Request
 * @param res Objeto Response
 */
function createPayment(req,res)
{
    //si el requerimiento es valido crea el nuevo sueldo
    var pay = new Payment({
        title:    security.cleanup(req.body.title),
        salary:   security.cleanup(req.body.salary),
    });
    //trata de guardar al sueldo recien creado
    savePaymentAndWriteResponse(pay,res);

}
/**
 * Actualiza un sueldo en la base de datos
 *
 * @param req   Objeto HTTP Request
 * @param res   Objeto HTTP Response
 *
 */
function updatePayment(req,res)
{
     //busca el sueldo en la base de datos
     getPaymentAndProcessResult(req.params.id,res,function(res,pay){
        pay.title = security.cleanup(req.body.title);
        pay.salary = security.cleanup(req.body.salary);

        //guarda los cambios
        savePaymentAndWriteResponse(pay,res);
     });
}

/**
 * Obtiene un sueldo y llama a un callback para procesar los resultados
 *
 */
function getPaymentAndProcessResult(id,res,callback)
{
    genericController.getEntityAndProcessResult(Payment,id,res,function(err,id,res){
        logger.error("error obteniendo al sueldo con ID: " + id);
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(id,res){
         responseFormatter.send404Response(res,"there is no payment with id: " + id);
    },function(pay,res){
        //si no hay errores se devuelve al proyecto consultado 
        callback(res,pay);
     });
}

/**
 * Guarda el sueldo en la base de datos y escribe en la respuesta
 *
 * TODO: buscar una mejor manera de hacer esto, este metodo no deberia escribir la respuesta
 *
 * @param pay   Entidad Payment a guardar
 *
 */
function savePaymentAndWriteResponse(pay,res)
{
    genericController.saveEntityAndWriteResponse(pay,res,function(err,pay,res){
       logger.error("no se pudo guardar el sueldo: " + pay);
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(asg,res){
        //si sale todo ok se le envia el nuevo sueldo al usuario
        responseFormatter.send200Response(res,pay);
    });
}
/**
 * Elimina el Sueldo de la base de datos
 *
 * TODO: buscar una mejor manera de hacer esto, este metodo no deberia escribir la respuesta
 *
 * @param pay   Entidad Employee a eliminar
 *
 */
function removePaymentAndWriteResponse(pay,res)
{
    genericController.removeEntityAndWriteResponse(pay,res,function(err,pay,res){
        logger.error("no se pudo eliminar el sueldo: " + pay);
        logger.error(err.message);
        responseFormatter.send500Response(res,err.message);
    },function(pay,res){
        //si sale todo ok se le envia el proyecto eliminado al usuario
        responseFormatter.send200Response(res,pay);
    });
}