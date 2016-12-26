var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

//sets schema

var projectSchema = new Schema({	  
  pname: String,
  budget: Number
});
//expors schema
module.exports = mongoose.model('Project', projectSchema); 