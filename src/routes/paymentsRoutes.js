var payController = require('../controllers/paymentController');
var express = require('express');
var router = express.Router();


// '/api/payment'
router.route('/')
    .get(payController.findAllPayments)
    .post(payController.addPayment);

// '/api/payment/:id'
router.route('/:id')
    .get(payController.findById)
    .delete(payController.deletePayment)
    .put(payController.updatePayment);

module.exports = router;