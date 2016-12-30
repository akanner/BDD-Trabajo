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
//expors schema
module.exports = mongoose.model('Payment', paymentSchema); 