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
  }
};


module.exports = employeeSchema;