const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    fromdate: {
      type: Date,
      required: [true, 'Check-in date is required']
    },
    todate: {
      type: Date,
      required: [true, 'Check-out date is required']
    },
    totaldays: {
      type: Number,
      required: true,
      min: [1, 'Booking must be at least 1 day']
    },
    nightlyPriceSnapshot: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true
    },
    guestEmail: {
      type: String,
      required: [true, 'Guest email is required'],
      trim: true,
      lowercase: true
    },
    guestPhone: {
      type: String,
      required: [true, 'Guest phone is required'],
      trim: true
    },
    guestCount: {
      type: Number,
      default: 1,
      min: 1
    },
    specialRequests: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
      default: 'confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'paid'
    },
    cancellationReason: {
      type: String
    },
    cancelledAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast availability queries and user booking history
bookingSchema.index({ room: 1, fromdate: 1, todate: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
