const Room = require('../models/Room');
const Booking = require('../models/Booking');
const ServiceRequest = require('../models/ServiceRequest');

// @desc    Staff operational dashboard overview
// @route   GET /api/staff/overview
// @access  Private (Staff/Admin)
const getStaffOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Bookings checking in today
    const checkInsToday = await Booking.find({
      fromdate: { $gte: today, $lt: tomorrow },
      status: 'confirmed'
    }).populate('room').populate('user', 'name phone');

    // Bookings checking out today
    const checkOutsToday = await Booking.find({
      todate: { $gte: today, $lt: tomorrow },
      status: 'checked-in'
    }).populate('room').populate('user', 'name phone');

    // Rooms needing housekeeping/cleaning
    const roomsNeedingCleaning = await Room.find({
      isActive: true,
      operationalStatus: 'cleaning'
    });

    // Open service tickets
    const openServiceRequests = await ServiceRequest.find({
      status: { $in: ['pending', 'in_progress'] }
    }).populate('room').populate('requestedBy', 'name');

    return res.status(200).json({
      success: true,
      data: {
        checkInsToday,
        checkOutsToday,
        roomsNeedingCleaning,
        openServiceRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process guest check-in
// @route   POST /api/staff/bookings/:id/check-in
// @access  Private (Staff/Admin)
const checkInGuest = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-in booking with status '${booking.status}'.`
      });
    }

    booking.status = 'checked-in';
    await booking.save();

    // Mark room operational status as occupied
    await Room.findByIdAndUpdate(booking.room._id, { operationalStatus: 'occupied' });

    return res.status(200).json({
      success: true,
      message: `Guest ${booking.guestName} successfully checked into Room ${booking.room.roomNumber}.`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process guest check-out
// @route   POST /api/staff/bookings/:id/check-out
// @access  Private (Staff/Admin)
const checkOutGuest = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    if (booking.status !== 'checked-in') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-out booking with status '${booking.status}'. Must be checked-in.`
      });
    }

    booking.status = 'checked-out';
    await booking.save();

    // Mark room operational status as cleaning so housekeeping is alerted
    await Room.findByIdAndUpdate(booking.room._id, { operationalStatus: 'cleaning' });

    // Automatically create housekeeping service request
    await ServiceRequest.create({
      room: booking.room._id,
      requestedBy: req.user._id,
      type: 'housekeeping',
      priority: 'high',
      description: `Turnover cleaning required for Room ${booking.room.roomNumber} after checkout.`,
      status: 'pending'
    });

    return res.status(200).json({
      success: true,
      message: `Guest ${booking.guestName} successfully checked out. Room ${booking.room.roomNumber} set to cleaning status.`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room statuses for housekeeping
// @route   GET /api/staff/rooms
// @access  Private (Staff/Admin)
const getStaffRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ roomNumber: 1 });
    return res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room operational status
// @route   PATCH /api/staff/rooms/:id/status
// @access  Private (Staff/Admin)
const updateRoomOperationalStatus = async (req, res, next) => {
  try {
    const { operationalStatus } = req.body;
    const validStatuses = ['available', 'occupied', 'cleaning', 'maintenance'];

    if (!validStatuses.includes(operationalStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid operational status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { operationalStatus },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} status updated to '${operationalStatus}'.`,
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service requests
// @route   GET /api/staff/services
// @access  Private (Staff/Admin)
const getServiceRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find()
      .populate('room')
      .populate('requestedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create service request
// @route   POST /api/staff/services
// @access  Private
const createServiceRequest = async (req, res, next) => {
  try {
    const { roomId, type, priority, description } = req.body;

    if (!roomId || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide room and description.'
      });
    }

    const serviceRequest = await ServiceRequest.create({
      room: roomId,
      requestedBy: req.user._id,
      type: type || 'housekeeping',
      priority: priority || 'medium',
      description
    });

    const populated = await ServiceRequest.findById(serviceRequest._id)
      .populate('room')
      .populate('requestedBy', 'name');

    return res.status(201).json({
      success: true,
      message: 'Service request created successfully.',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service request status
// @route   PATCH /api/staff/services/:id/status
// @access  Private (Staff/Admin)
const updateServiceRequestStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found.'
      });
    }

    if (status) request.status = status;
    if (resolutionNotes) request.resolutionNotes = resolutionNotes;
    if (status === 'in_progress' && !request.assignedTo) {
      request.assignedTo = req.user._id;
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Service request updated.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffOverview,
  checkInGuest,
  checkOutGuest,
  getStaffRooms,
  updateRoomOperationalStatus,
  getServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus
};
