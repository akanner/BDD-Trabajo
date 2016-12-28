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
//expors schema
module.exports = mongoose.model('Project', projectSchema); 