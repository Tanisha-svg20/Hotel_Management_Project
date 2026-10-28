const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { checkRoomAvailability, getAvailableRoomsForDates } = require('../services/availabilityService');

// @desc    Get all rooms with dynamic filters & date availability
// @route   GET /api/rooms
// @access  Public
const getAllRooms = async (req, res, next) => {
  try {
    const { type, minPrice, maxPrice, capacity, fromdate, todate, status } = req.query;

    // If dates are provided, use availability service
    if (fromdate && todate) {
      let rooms = await getAvailableRoomsForDates(fromdate, todate, capacity || 1);

      if (type && type !== 'All') {
        rooms = rooms.filter(r => r.type === type);
      }
      if (minPrice) {
        rooms = rooms.filter(r => r.rent >= Number(minPrice));
      }
      if (maxPrice) {
        rooms = rooms.filter(r => r.rent <= Number(maxPrice));
      }

      return res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms
      });
    }

    // Standard query without dates
    const query = { isActive: true };

    if (type && type !== 'All') {
      query.type = type;
    }
    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }
    if (minPrice || maxPrice) {
      query.rent = {};
      if (minPrice) query.rent.$gte = Number(minPrice);
      if (maxPrice) query.rent.$lte = Number(maxPrice);
    }
    if (status) {
      query.operationalStatus = status;
    }

    const rooms = await Room.find(query).populate('hotel').sort({ rent: 1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }

    const reviews = await Review.find({ room: room._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    return res.status(200).json({
      success: true,
      data: {
        ...room.toObject(),
        reviews,
        reviewCount: reviews.length,
        averageRating: avgRating
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check room availability for specific dates
// @route   GET /api/rooms/:id/availability
// @access  Public
const checkAvailability = async (req, res, next) => {
  try {
    const { fromdate, todate } = req.query;

    if (!fromdate || !todate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both check-in (fromdate) and check-out (todate) query parameters.'
      });
    }

    const availability = await checkRoomAvailability(req.params.id, fromdate, todate);

    return res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new room (with image upload support)
// @route   POST /api/rooms
// @access  Private (Admin)
const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, type, description, rent, capacity, amenities, count, hotel } = req.body;

    if (!roomNumber || !type || !description || !rent) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomNumber, type, description, and rent.'
      });
    }

    // Process uploaded files if any
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.photos) {
      photos = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
    }

    // Provide default fallback photo if none uploaded
    if (photos.length === 0) {
      photos = ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'];
    }

    const parsedAmenities = typeof amenities === 'string'
      ? amenities.split(',').map(s => s.trim()).filter(Boolean)
      : amenities;

    const existingRoom = await Room.findOne({ roomNumber: String(roomNumber).trim() });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room with number ${roomNumber} already exists.`
      });
    }

    const room = await Room.create({
      roomNumber: String(roomNumber).trim(),
      type,
      description,
      rent: Number(rent),
      capacity: Number(capacity) || 2,
      amenities: parsedAmenities || ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning'],
      photos,
      count: Number(count) || 1,
      hotel: hotel || null
    });

    return res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }

    const { roomNumber, type, description, rent, capacity, amenities, count, operationalStatus, isActive } = req.body;

    if (roomNumber) room.roomNumber = String(roomNumber).trim();
    if (type) room.type = type;
    if (description) room.description = description;
    if (rent !== undefined) room.rent = Number(rent);
    if (capacity !== undefined) room.capacity = Number(capacity);
    if (count !== undefined) room.count = Number(count);
    if (operationalStatus) room.operationalStatus = operationalStatus;
    if (isActive !== undefined) room.isActive = Boolean(isActive);

    if (amenities) {
      room.amenities = typeof amenities === 'string'
        ? amenities.split(',').map(s => s.trim()).filter(Boolean)
        : amenities;
    }

    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
      room.photos = [...room.photos, ...newPhotos];
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully.',
      data: room
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate or safely delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }

    // Check if room has active reservations
    const activeBookings = await Booking.find({
      room: room._id,
      status: { $in: ['confirmed', 'checked-in'] },
      todate: { $gte: new Date() }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room: there are ${activeBookings.length} upcoming or ongoing active reservations. Consider setting it inactive instead.`
      });
    }

    // Soft delete by deactivating to preserve historical integrity
    room.isActive = false;
    await room.save();

    return res.status(200).json({
      success: true,
      message: 'Room has been deactivated and removed from public booking inventory.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  deleteRoom
};
