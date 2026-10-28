const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Admin high-level overview statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalRooms = await Room.countDocuments({ isActive: true });
    const availableRooms = await Room.countDocuments({ isActive: true, operationalStatus: 'available' });
    const occupiedRooms = await Room.countDocuments({ isActive: true, operationalStatus: 'occupied' });
    const cleaningRooms = await Room.countDocuments({ isActive: true, operationalStatus: 'cleaning' });
    const maintenanceRooms = await Room.countDocuments({ isActive: true, operationalStatus: 'maintenance' });

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const checkedInBookings = await Booking.countDocuments({ status: 'checked-in' });
    const checkedOutBookings = await Booking.countDocuments({ status: 'checked-out' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Revenue calculation from confirmed/checked-in/checked-out bookings
    const revenueAggregate = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'checked-in', 'checked-out'] },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueAggregate.length ? revenueAggregate[0].totalRevenue : 0;
    const totalUsers = await User.countDocuments();

    // 5 Most Recent Bookings
    const recentBookings = await Booking.find()
      .populate('room', 'roomNumber type rent')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          cleaning: cleaningRooms,
          maintenance: maintenanceRooms
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          checkedIn: checkedInBookings,
          checkedOut: checkedOutBookings,
          cancelled: cancelledBookings
        },
        revenue: {
          total: Math.round(totalRevenue * 100) / 100,
          currency: 'USD'
        },
        users: {
          total: totalUsers
        },
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings with filters & pagination
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('room')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PATCH /api/admin/bookings/:id/status
// @access  Private (Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
    }
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role & status
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (role) {
      if (!['customer', 'staff', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be customer, staff, or admin.'
        });
      }
      user.role = role;
    }

    if (status) {
      if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active or suspended.'
        });
      }
      user.status = status;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User permissions updated successfully.',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reports and analytics
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = async (req, res, next) => {
  try {
    // 1. Room Type distribution & booking counts
    const roomTypeStats = await Room.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          totalRooms: { $sum: 1 },
          avgRent: { $avg: '$rent' }
        }
      }
    ]);

    // 2. Monthly Revenue aggregation for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'checked-in', 'checked-out'] },
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          bookingsCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly data for easy frontend chart rendering
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyRevenue.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: Math.round(item.revenue),
      bookings: item.bookingsCount
    }));

    return res.status(200).json({
      success: true,
      data: {
        roomTypeStats,
        monthlyRevenue: formattedMonthly
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  updateUserRole,
  getReports
};
