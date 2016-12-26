/*
 * Esquema utilizado para realizar las validaciones de los requerimientos usando express-validations
 */

 var projectSchema = {
 'pname': {
    in: 'body',
    notEmpty: true,
    errorMessage: "pname is required"
  },
  'budget': {
  	in: 'body',
    notEmpty: true,
    errorMessage: "budget is required",
    isNumeric: {
    	errorMessage: "budget must be numeric"
    }
  }
};


module.exports = projectSchema;