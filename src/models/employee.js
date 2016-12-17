var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

//sets schema

var employeeSchema = new Schema({	  
  ename: String,
  title: String
});
//expors schema
module.exports = mongoose.model('Employee', employeeSchema); 