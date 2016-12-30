/*
 * Esquema utilizado para realizar las validaciones de los requerimientos usando express-validations
 */

 var paymentSchema = {
 'title': {
    in: 'body',
    notEmpty: true,
    errorMessage: "title is required"
  },
  'salary': {
  	in: 'body',
    notEmpty: true,
    errorMessage: 'salary is required', // Error message for the parameter
    isNumeric: {
    	errorMessage: "salary must be numeric"
    }
  }
};



module.exports = paymentSchema;