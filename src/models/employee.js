var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var idvalidator = require('mongoose-id-validator');
//sets schema

var employeeSchema = new Schema({	  
  ename: String,
  title: {type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'}
});



//agrega un metodo para obtener los campos que se pueden "popular" (de populate)
employeeSchema.statics.populations = function(){return "title"};
//maneja las actualizaciones de las relaciones
employeeSchema.plugin(idvalidator,{message : 'Bad ID value for Payment'});
//expors schema
module.exports = mongoose.model('Employee', employeeSchema); 