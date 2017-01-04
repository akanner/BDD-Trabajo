/*
 * Esquema utilizado para realizar las validaciones de los requerimientos usando express-validations
 */

 var employeeSchema = {
 'title': {
    in: 'body',
    notEmpty: true,
    errorMessage: "invalid field: title"
  },
  'ename': {
  	in: 'body',
    notEmpty: true,
    errorMessage: 'Invalid field: ename' // Error message for the parameter
  },
   'title.tname': {
    in: 'body',
    notEmpty: true,
    errorMessage: "invalid field: tname"
  },
  'title.salary': {
    in: 'body',
    notEmpty: true,
    errorMessage: "invalid field: tname",
    isNumeric: {
    	errorMessage: "salary must be numeric"
    }
  }
};



module.exports = employeeSchema;