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