const express = require('express');
const router = express.Router();
const { initiatePayment, getReceipt } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/create-intent', verifyToken, initiatePayment);
router.get('/receipt/:bookingId', verifyToken, getReceipt);

module.exports = router;
