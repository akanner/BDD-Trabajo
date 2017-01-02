var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;
//assignmnets schema
var Assignment  = require('../models/assignment');
//sets schema

var projectSchema = new Schema({	  
  pname: String,
  budget: Number,
  assignments:[{
  	type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
	}]
});
//agrega un metodo para obtener los campos que se pueden "popular" (de populate)
projectSchema.statics.populations = function(){return "assignments"};
//expors schema
module.exports = mongoose.model('Project', projectSchema); 