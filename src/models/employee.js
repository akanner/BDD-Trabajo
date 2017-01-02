var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var idvalidator = require('mongoose-id-validator');
//sets schema

var employeeSchema = new Schema({	  
  ename: String,
  title: {type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'}
});


//se asegura que los ids de emp_id y proj_id existan antes de guardar el modelo
employeeSchema.plugin(idvalidator,{message : 'Bad ID value for title'});

//expors schema
module.exports = mongoose.model('Employee', employeeSchema); 