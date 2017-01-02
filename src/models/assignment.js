/**
 * Modelo de las asignaciones de los proyectos
 *
 */
var idvalidator = require('mongoose-id-validator');
var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

//sets schema

var assignmentSchema = new Schema({	  
  emp_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
  },
  proj_id: {
  	type: mongoose.Schema.Types.ObjectId,
  	ref: 'Project',
    required: true
  },
  responsibilities: String,
  duration: Number
});
//agrega un metodo para obtener los campos que se pueden "popular" (de populate)
assignmentSchema.statics.populations = function(){return "emp_id proj_id"};
//se asegura que los ids de emp_id y proj_id existan antes de guardar el modelo
assignmentSchema.plugin(idvalidator,{message : 'Bad ID value for Project or Employee'});
//expors schema
module.exports = mongoose.model('Assignment', assignmentSchema); 