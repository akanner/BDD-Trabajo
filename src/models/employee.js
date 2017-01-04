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
//expors schema
module.exports = mongoose.model('Employee', employeeSchema); 