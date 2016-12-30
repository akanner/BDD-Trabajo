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
    Payment.find(function(err, pay) {
    	//en caso de error se loguea la excepcion y se devueve el error al usuario
	    if(err)
	    {
	    	logger.error("error obteniendo a los sueldos de la base de datos");
	    	logger.error(err.message);
	    	responseFormatter.send500Response(res,err.message);
	    } 
	    else
    	{
    		//si no hay errores se devuelve la coleccion de pagos al usuario
    		responseFormatter.send200Response(res,pay);
    	}
	        
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

    Payment.findById(validId, function(err, pay) {
    //si hay un error se loguea la excepcion y se informa al usuario
    if(err)
    {
    	logger.error("error obteniendo al sueldo con ID: " + validId);
    	logger.error(err.message);
    	responseFormatter.send500Response(res,err.message);
        return;
    }
    if(!pay)
    {
        responseFormatter.send404Response(res,"there is no payment with id: " + req.params.id);
        return;
    }
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
    Payment.findById(req.params.id, function(err, pay) {
        if(err)
        {
             //si hay algun error se le informa al usuario
            logger.error("no se pudo encontrar al sueldo con id " + req.params.id + " : " + err);
            responseFormatter.send500Response(res,err.message);
            return;
        }
        if(!pay)
        {
            //si no existe el payment
            responseFormatter.send404Response(res,"there is no payment with id: " + req.params.id);
            return;
        }
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
     var pay = Payment.findById(req.params.id,function(err,pay){
         if(err)
         {
            //si hay algun error se le informa al usuario
            logger.error("no se pudo encontrar al sueldo con id " + req.params.id + " : " + err);
            responseFormatter.send500Response(res,err.message);
            return;
         }
         if(!pay)
         {
            responseFormatter.send404Response(res,"there is no payment with id: " + req.params.id);
            return;
         }
         pay.title = security.cleanup(req.body.title);
         pay.salary = security.cleanup(req.body.salary);

         //guarda los cambios
        savePaymentAndWriteResponse(pay,res);


         
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
    pay.save(function(err, pay) {
        if(err) 
        {
            logger.error("no se pudo guardar el sueldo: " + JSON.stringify(pay));
            logger.error(err.message);
            responseFormatter.send500Response(res,err.message);
        }
        else
        {
            //si sale todo ok se le envia el nuevo sueldo al usuario
            responseFormatter.send200Response(res,pay);
        }
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
     pay.remove(function(err) {
        if(err) 
        {
            logger.error("no se pudo eliminar el sueldo: " + JSON.stringify(pay));
            logger.error(err.message);
            responseFormatter.send500Response(res,err.message);
        }
        else
        {
            //si sale todo ok se le envia el nuevo sueldo al usuario
            responseFormatter.send200Response(res,pay);
        }
     });

}