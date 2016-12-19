var empController = require('../controllers/EmployeeController');
var express = require('express');
var router = express.Router();


// '/api/emplyees'
router.route('/')
    .get(empController.findAllEmployees)
    .post(empController.addEmployee);

// '/api/emplyees/:id'
router.route('/:id')
    .get(empController.findById)
    .delete(empController.deleteEmployee)
    .put(empController.updateEmployee);

module.exports = router;