/**
 * Etablese una serie de metodos para enviar respuestas JSON con un formato uniforme
 *
 */

 /**
  * Formatea una respuesta JSON con el siguiente formato
  * {
  *	  status: httpCode,
  *   message: payload 
  * }
  *
  *
  * @param int httpCode	Codigo de respuesta HTTP
  * @param obj payload	Respuesta devuelta por el servidor
  *
  */
exports.formatResponse = function(httpCode,payload)
 {
    var jsonResponse = {};
    jsonResponse["status"] = httpCode;
    jsonResponse["message"] = payload;
    return jsonResponse;
 }

 function formatResponse(httpCode,payload)
 {
    var jsonResponse = {};
    jsonResponse["status"] = httpCode;
    jsonResponse["message"] = payload;
    return jsonResponse;
 }

 function sendResponse(res,httpCode,payload)
 {
    res.status(httpCode).json(formatResponse(httpCode,payload));
 }
/**
 * Devuelve una respuesta 404 al usuario
 *
 * @param res       HTTP Response
 * @param payload   informacion a enviar
 *
 */
 exports.send404Response = function(res,payload)
 {
     sendResponse(res,404,payload);
 }
/**
 * Devuelve una respuesta 412 al usuario
 *
 * @param res       HTTP Response
 * @param payload   informacion a enviar
 *
 */
 exports.send412Response = function(res,payload)
 {
   sendResponse(res,412,payload);
 }
/**
 * Devuelve una respuesta 400 al usuario
 *
 * @param res       HTTP Response
 * @param payload   informacion a enviar
 *
 */
 exports.send400Response = function(res,payload)
 {
   sendResponse(res,400,payload);
 }
/**
 * devuelve una respuesta con codigo http 500
 *
 * @param res     HTTP Response
 * @param payload informacion a enviar
 *
 */
 exports.send500Response = function(res,payload)
 {
    sendResponse(res,500,payload);
 }
/**
 * devuelve una respuesta con codigo http 200
 *
 * @param res     HTTP Response
 * @param payload informacion a enviar
 *
 */
 exports.send200Response = function(res,payload)
 {
   sendResponse(res,200,payload);
 }