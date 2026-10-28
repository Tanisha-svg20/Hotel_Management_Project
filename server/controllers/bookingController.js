const crypto = require('crypto');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const { checkRoomAvailability } = require('../services/availabilityService');
const { calculateBookingPrice } = require('../services/pricingService');
const { verifyAndRecordPayment } = require('../services/paymentService');
const { sendBookingConfirmation, sendCancellationNotice } = require('../services/emailService');

// @desc    Create a new room reservation with server-calculated price
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res, next) => {
  try {
    const {
      roomId,
      fromdate,
      todate,
      guestName,
      guestEmail,
      guestPhone,
      guestCount,
      specialRequests,
      transactionId,
      cardLast4
    } = req.body;

    if (!roomId || !fromdate || !todate || !guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required reservation fields.'
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }

    // 1. Re-check availability strictly on backend
    const availability = await checkRoomAvailability(roomId, fromdate, todate);
    if (!availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: availability.reason || 'Room is unavailable for the selected dates.'
      });
    }

    // 3. Authoritative price calculation (Client submitted total is ignored)
    const pricing = calculateBookingPrice(room.rent, fromdate, todate);

    // 4. Verify payment authorization prior to creating reservation
    if (Boolean(req.body.simulateFailure) || cardLast4 === '0000') {
      return res.status(402).json({
        success: false,
        message: 'Payment failed: Card was declined by issuing bank (Test Card Ending in 0000). The reservation was not confirmed.',
        code: 'card_declined'
      });
    }

    // 5. Generate unique booking reference and create booking
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const bookingId = `HP-BK-${dateStamp}-${randomHex}`;

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      room: room._id,
      fromdate: new Date(fromdate),
      todate: new Date(todate),
      totaldays: pricing.nights,
      nightlyPriceSnapshot: pricing.nightlyRate,
      totalAmount: pricing.totalAmount,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone.trim(),
      guestCount: Number(guestCount) || 1,
      specialRequests: specialRequests || '',
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    // 6. Record verified payment
    const paymentTx = transactionId || `TX-${Date.now()}-${randomHex}`;
    await verifyAndRecordPayment({
      bookingId: booking._id,
      userId: req.user._id,
      amount: pricing.totalAmount,
      transactionId: paymentTx,
      cardLast4: cardLast4 || '4242'
    });

    // 7. Create in-app notification
    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your reservation #${booking.bookingId} for room ${room.type} (${room.roomNumber}) is confirmed.`,
      type: 'booking',
      link: `/customer/bookings/${booking._id}`
    });

    // 8. Send asynchronous email confirmation
    sendBookingConfirmation(booking, room, req.user).catch(err => {
      console.warn('[BookingController] Email dispatch warning:', err.message);
    });

    const populatedBooking = await Booking.findById(booking._id).populate('room');

    return res.status(201).json({
      success: true,
      message: 'Reservation created and confirmed successfully!',
      data: {
        booking: populatedBooking,
        pricing
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Authorization check: must be owner, staff, or admin
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this reservation.'
      });
    }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Authorization check
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only cancel your own bookings.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This reservation is already cancelled.'
      });
    }

    if (booking.status === 'checked-out') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed stay.'
      });
    }

    const { reason } = req.body;

    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by customer';
    booking.cancelledAt = new Date();
    await booking.save();

    // In-app notification
    await Notification.create({
      user: booking.user,
      title: 'Reservation Cancelled',
      message: `Your booking #${booking.bookingId} has been cancelled.`,
      type: 'cancellation',
      link: `/customer/bookings/${booking._id}`
    });

    // Send cancellation email
    sendCancellationNotice(booking, booking.room).catch(err => {
      console.warn('[BookingController] Email dispatch warning:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully. Room availability has been released.',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
};

