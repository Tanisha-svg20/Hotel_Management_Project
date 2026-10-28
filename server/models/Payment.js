const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: String,
      enum: ['stripe', 'razorpay', 'dev_adapter'],
      default: 'dev_adapter'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    cardLast4: {
      type: String,
      default: '4242'
    },
    receiptNumber: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ booking: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
