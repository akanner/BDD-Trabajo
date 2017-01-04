/**
 * Modelo de las asignaciones de los proyectos
 *
 */
var idvalidator = require('mongoose-id-validator'),
    mongoose = require('mongoose'),
    relationship = require("mongoose-relationship"),  
    Schema   = mongoose.Schema;

//sets schema

var assignmentSchema = new Schema({	  
  employee : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
  },
  project: {
  	type: mongoose.Schema.Types.ObjectId,
  	ref: 'Project',
    required: true,
    childPath:"assignments"
  },
  responsibilities: String,
  duration: Number
});
//maneja las actualizaciones de las relaciones
assignmentSchema.plugin(relationship, { relationshipPathName:'project' });
//agrega un metodo para obtener los campos que se pueden "popular" (de populate)
assignmentSchema.statics.populations = function(){return "employee project"};
//se asegura que los ids de employee y project existan antes de guardar el modelo
assignmentSchema.plugin(idvalidator,{message : 'Bad ID value for Project or Employee'});
//expors schema
module.exports = mongoose.model('Assignment', assignmentSchema); 