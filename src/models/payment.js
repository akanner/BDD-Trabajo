/**
 * Modelo de la entidad 'payment'
 *
 */

var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

//sets schema

var paymentSchema = new Schema({	  
  title: String,
  salary: Number
});

//agrega un metodo para obtener los campos que se pueden "popular" (de populate)
paymentSchema.statics.populations = function(){return ""};
//expors schema
module.exports = mongoose.model('Payment', paymentSchema); 