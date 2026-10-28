const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { createPaymentIntent } = require('../services/paymentService');

// @desc    Initiate payment session / intent
// @route   POST /api/payments/create-intent
// @access  Private
const initiatePayment = async (req, res, next) => {
  try {
    const { amount, bookingReference } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount specified.'
      });
    }

    const intent = await createPaymentIntent({
      amount: Number(amount),
      currency: 'USD',
      bookingReference: bookingReference || 'HP-RESERVATION',
      customerEmail: req.user.email
    });

    return res.status(200).json({
      success: true,
      data: intent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction receipt for a booking
// @route   GET /api/payments/receipt/:bookingId
// @access  Private
const getReceipt = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('room');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const payment = await Payment.findOne({ booking: booking._id });

    return res.status(200).json({
      success: true,
      data: {
        booking,
        payment: payment || {
          status: 'completed',
          provider: 'dev_adapter',
          transactionId: `TX-${booking.bookingId}`,
          receiptNumber: `REC-${booking.bookingId}`
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiatePayment,
  getReceipt
};

