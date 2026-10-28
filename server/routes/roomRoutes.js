const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.get('/:id/availability', checkAvailability);

// Admin-only routes
router.post('/', verifyToken, requireRole('admin'), upload.array('photos', 5), createRoom);
router.put('/:id', verifyToken, requireRole('admin'), upload.array('photos', 5), updateRoom);
router.delete('/:id', verifyToken, requireRole('admin'), deleteRoom);

module.exports = router;

