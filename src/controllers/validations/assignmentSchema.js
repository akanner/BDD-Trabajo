/*
 * Esquema utilizado para realizar las validaciones de los requerimientos usando express-validations
 */

 var assignmentSchema = {
 'employee': {
    in: 'body',
    notEmpty: true,
    errorMessage: "employee is required"
  },
  'project': {
  	in: 'body',
    notEmpty: true,
    errorMessage: 'project is required' // Error message for the parameter
  },
    'responsibilities': {
  	in: 'body',
    notEmpty: true,
    errorMessage: 'responsibilities is required' // Error message for the parameter
  },
    'duration': {
  	in: 'body',
    notEmpty: true,
    errorMessage: "duration is required",
    isNumeric: {
    	errorMessage: "duration must be numeric"
    }
  }
};


module.exports = assignmentSchema;