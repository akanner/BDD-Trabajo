var asgController = require('../controllers/assignmentController');
var express = require('express');
var router = express.Router();


// '/api/assignments'
router.route('/')
    .get(asgController.findAllAssignments)
    .post(asgController.addAssignment);

// '/api/assignments/:id'
router.route('/:id')
    .get(asgController.findById)
    .delete(asgController.deleteAssignment)
    .put(asgController.updateAssignment);

module.exports = router;