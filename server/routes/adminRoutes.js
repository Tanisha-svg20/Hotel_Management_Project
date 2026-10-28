const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  updateUserRole,
  getReports
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(verifyToken, requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/reports', getReports);

module.exports = router;

