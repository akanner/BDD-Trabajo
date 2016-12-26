var empController = require('../controllers/projectController');
var express = require('express');
var router = express.Router();


// '/api/emplyees'
router.route('/')
    .get(empController.findAllProjects)
    .post(empController.addProject);

// '/api/emplyees/:id'
router.route('/:id')
    .get(empController.findById)
    .delete(empController.deleteProject)
    .put(empController.updateProject);

module.exports = router;