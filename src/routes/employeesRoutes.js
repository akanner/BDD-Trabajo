var empController = require('../controllers/EmployeeController');
var express = require('express');
var router = express.Router();


// '/api/emplyees'
router.route('/')
    .get(empController.findAllEmployees)
    .post(empController.addTVEmployee);

// '/api/emplyees/:id'
router.route('/:id')
    .get(empController.findById)
    //.delete(empController.deleteApp)
    //.put(empController.updateApp);

module.exports = router;