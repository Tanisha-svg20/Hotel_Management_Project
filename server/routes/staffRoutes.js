const express = require('express');
const router = express.Router();
const {
  getStaffOverview,
  checkInGuest,
  checkOutGuest,
  getStaffRooms,
  updateRoomOperationalStatus,
  getServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus
} = require('../controllers/staffController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Protect all staff routes (accessible by staff and admin)
router.use(verifyToken, requireRole('staff', 'admin'));

router.get('/overview', getStaffOverview);
router.post('/bookings/:id/check-in', checkInGuest);
router.post('/bookings/:id/check-out', checkOutGuest);
router.get('/rooms', getStaffRooms);
router.patch('/rooms/:id/status', updateRoomOperationalStatus);
router.get('/services', getServiceRequests);
router.post('/services', createServiceRequest);
router.patch('/services/:id/status', updateServiceRequestStatus);

module.exports = router;

