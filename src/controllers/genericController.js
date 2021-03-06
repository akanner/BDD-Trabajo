/**
 * Define funciones comunes para los controladores
 *
 */

 //helper de seguridad
var SecurityHelper = require('../utils/securityHelper');
var security = new SecurityHelper();
/**
 * Busca todas las entidades que coincidan con los filtros enviados
 *
 * @param {object} entityModel      Modelo de Mongoose
 * @param {object} filters          Filtros de la consulta, si se envia {} no se filtra, solo se filtraran campos que existan en entityModel
 * @param {object} httpResponse     Objecto respuesta http
 * @param function errorCallbalk    Calkback en caso de algun error
 * @param function successCallback  callback a ejecutar luego de realizar la consulta
 */
exports.getAllEntities = function(entityModel,filters,httpResponse,errorCallback,successCallback){
     entityModel.find(filters)
     .exec(function(err, ent) {
        //en caso de error se loguea la excepcion y se devueve el error al usuario
        if(err)
        {
            errorCallback(err,httpResponse);
            return;
        } 
        else
        {
            //si no hay errores se devuelve la coleccion de entidades al usuario
            successCallback(httpResponse,ent);
            return;
        }
            
    });
}
/**
 * Intenta recuperar una entidad de la base de datos y procesa la respuesta
 *
 * @param entityModel				modelo de mongoose de la entidad a buscar
 * @param entityId					id de la entidad a buscar
 * @param 
 * @param httpResponse				respuesta HTTP
 * @param errorCallback				funcion a ejecutar en caso de error
 *	errorCallback(err,entityId,httpResponse)
 *  	@param err			String con el posible motivo del error arrojado durante la ejecucion de la consulta
 *		@param entityId		Id de la entidad buscada, util para logueo
 *		@param httpResponse	objeto respuesta http
 * @param entityNotFoundCallback	funcion a ejecutar en caso de que no exista la entidad buscada
 *	entityNotFoundCallback(entityId,httpResponse)
 *		@param entityId		Id de la entidad buscada, util para logueo
 *		@param httpResponse	objeto respuesta http
 * @param successCallback			funcion a ejecutar en caso de que la operacion sea exitosa
 *	successCallback(entityObj,httpResponse)
 *		@param entityObj	entidad encontrada en la base de datos
 *		@param httpResponse	objeto respuesta http
 */
 exports.getEntityAndProcessResult = function(entityModel,entityId,httpResponse,errorCallback,entityNotFoundCallback,successCallback){
 	 entityModel.findById(entityId)
     .populate(entityModel.populations())//el metodo populations() devuelve una coleccion de todos los campos que se pueden "popular"
     .exec(function(err, entityObj) {
     //si hay un error se loguea la excepcion y se informa al usuario
     if(err)
     {
         errorCallback(err,entityId,httpResponse);
         return;
     }
     if(!entityObj)
     {
         entityNotFoundCallback(entityId,httpResponse);
         return;
     }
     //si no hay errores se devuelve al proyecto consultado 
     successCallback(entityObj,httpResponse)
     });
 }
/**
 * Guarda una entidad en la base de datos
 * 
 * @param entityToSave	Modelo de mongoose a guardar
 * @param httpResponse	Respuesta HTTP
 * @param errorCallback	Funcion a ejecutar en caso de error
 *	errorCallback(err,entity,httpResponse)
 *  	@param err			String con el posible motivo del error arrojado durante la ejecucion de la consulta
 *		@param entity		entidad que no pudo ser guardada, util para loguear
 *		@param httpResponse	objeto respuesta http
 * @param successCallback			funcion a ejecutar en caso de que la operacion sea exitosa
 *	successCallback(entityObj,httpResponse)
 *		@param entityObj	entidad encontrada en la base de datos
 *		@param httpResponse	objeto respuesta http
 */
 exports.saveEntityAndWriteResponse = function(entityToSave,httpResponse,errorCallback,successCallback){
 	    entityToSave.save(function(err, entity) {
        if(err) 
        {
            if(err.name == "ValidationError"){
                //en este caso obtengo el mensaje de adentro del objeto err
                //caso contrario mantengo el error por defecto
                //estos errores son los errores producidos al intentar guardar un objeto con alguna propiedad referenciando a un objeto inexistente
                err.message = extractErrorMessageFromValidationError(err);
            }
            
        	//si hay algun error se llama al errorCallback
           errorCallback(err,entityToSave,httpResponse);
        }
        else
        {
        	//si no hay errores se ejecuta successCallback
            successCallback(entityToSave,httpResponse);
        }
    });
 }
/**
 * Elimina una entidad en la base de datos
 * 
 * @param entityToSave	Modelo de mongoose a eliminar
 * @param httpResponse	Respuesta HTTP
 * @param errorCallback	Funcion a ejecutar en caso de error
 *	errorCallback(err,entity,httpResponse)
 *  	@param err			String con el posible motivo del error arrojado durante la ejecucion de la consulta
 *		@param entity		entidad que no pudo ser eliminada, util para loguear
 *		@param httpResponse	objeto respuesta http
 * @param successCallback			funcion a ejecutar en caso de que la operacion sea exitosa
 *	successCallback(entityObj,httpResponse)
 *		@param entityObj	entidad eliminada en la base de datos
 *		@param httpResponse	objeto respuesta http
 */
 exports.removeEntityAndWriteResponse = function(entityToDelete,httpResponse,errorCallback,successCallback){
 	entityToDelete.remove(function(err) {
        if(err) 
        {
        	//si hay algun error se llama al errorCallback
           errorCallback(err,entityToDelete,httpResponse);
        }
        else
        {
        	//si no hay errores se ejecuta successCallback
            successCallback(entityToDelete,httpResponse);
        }
     });
 }

 /**
  * filtra los parametros enviados como query parameters en el requerimiento http de acuerdo a los nombres pasados por parametro
  * 
  * @param {object} queryParameters     parametros enviados como query parameters dentro del requerimiento http
  * @param [string] parametersNames     lista con los nombres de los parametros que se deben obtener
  *
  * @return {object} parametros filtrados
  *
  */
 exports.filterQueryParameters =function(queryParameters,parametersNames){
    var filteredParameters = {};
    parametersNames.forEach(function(paramName){
        var paramValue = queryParameters[paramName];
        //si el parametro existe se sanitiza, y se filtra
        if(paramValue){
            filteredParameters[paramName] = security.cleanup(paramValue);
        }
    });
    return filteredParameters;
 }
/**
 * la funcion devuelve el motivo del error en el caso de intentar 
 * guardar una entidad que referencia a ids que no existen en la base de datos
 *
 * @param {object} err Objeto que representa un error de validacion del paquete mongoose-id-validator
 *
 * @return string Causas del error
 *
 */
 function extractErrorMessageFromValidationError(err){
    var errorMessages=[];
    /*obtiene los errores del objeto err, dicho objeto es semejante al siguiente ejemplo
    { [ValidationError: Assignment validation failed]
      message: 'Assignment validation failed',
      name: 'ValidationError',
      errors: 
       { project: 
          { [ValidatorError: Bad ID value for Project or Employee]
            message: 'Bad ID value for Project or Employee',
            name: 'ValidatorError',
            properties: [Object],
            kind: 'user defined',
            path: 'project',
            value: 5873cfe33d11c51c14d58c63 },
         employee: 
          { [ValidatorError: Bad ID value for Project or Employee]
            message: 'Bad ID value for Project or Employee',
            name: 'ValidatorError',
            properties: [Object],
            kind: 'user defined',
            path: 'employee',
            value: 5873cf713d11c51c14d402dc } } }
*/
    var errors = err.errors;
    console.log(errors.project);
    var errorsProperties = Object.keys(errors);
    
    //iteramos sobre las propiedades del objeto, en el ejemplo son project y employee
    errorsProperties.forEach(function(elem){
        errorMessages.push(errors[elem].message);
    })
       
    //devuelve los errores de la valuelidacion separados por coma
    return errorMessages.join();
 }