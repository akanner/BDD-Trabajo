/*
 * Esquema utilizado para realizar las validaciones de los requerimientos usando express-validations
 */

 var assignmentSchema = {
 'emp_id': {
    in: 'body',
    notEmpty: true,
    errorMessage: "emp_id is required"
  },
  'proj_id': {
  	in: 'body',
    notEmpty: true,
    errorMessage: 'proj_id is required' // Error message for the parameter
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