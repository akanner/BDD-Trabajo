/**
 * Define funciones comunes para los controladores
 *
 */

exports.getAllEntities = function(entityModel,httpResponse,errorCallback,successCallback){
     entityModel.find()
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
     .populate(entityModel.populations().join(" "))//el metodo populations() devuelve una coleccion de todos los campos que se pueden "popular"
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