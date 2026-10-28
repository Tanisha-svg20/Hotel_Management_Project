const Booking = require('../models/Booking');
const Room = require('../models/Room');

/**
 * Checks whether a room is available for the given date range.
 * Interval convention: Check-in inclusive, Check-out exclusive [fromdate, todate)
 * 
 * @param {string|ObjectId} roomId 
 * @param {Date|string} fromDate 
 * @param {Date|string} toDate 
 * @param {string} [excludeBookingId] - Optional bookingId to exclude (for modifications)
 * @returns {Promise<{isAvailable: boolean, reason?: string, overlappingCount: number, capacity: number}>}
 */
const checkRoomAvailability = async (roomId, fromDate, toDate, excludeBookingId = null) => {
  const checkIn = new Date(fromDate);
  const checkOut = new Date(toDate);

  // Normalize to 00:00:00 UTC to prevent time zone mismatch
  checkIn.setUTCHours(0, 0, 0, 0);
  checkOut.setUTCHours(0, 0, 0, 0);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return { isAvailable: false, reason: 'Invalid check-in or check-out date format.' };
  }

  if (checkIn >= checkOut) {
    return { isAvailable: false, reason: 'Check-out date must be after check-in date.' };
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return { isAvailable: false, reason: 'Room not found.' };
  }

  if (!room.isActive) {
    return { isAvailable: false, reason: 'This room is currently deactivated.' };
  }

  if (room.operationalStatus === 'maintenance') {
    return { isAvailable: false, reason: 'This room is currently undergoing maintenance.' };
  }

  // Find all active overlapping bookings for this room
  // Overlap condition: (existing.fromdate < checkOut) AND (existing.todate > checkIn)
  const query = {
    room: roomId,
    status: { $in: ['confirmed', 'checked-in', 'pending'] },
    fromdate: { $lt: checkOut },
    todate: { $gt: checkIn }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBookings = await Booking.find(query);
  const totalUnits = room.count || 1;
  const isAvailable = overlappingBookings.length < totalUnits;

  return {
    isAvailable,
    reason: isAvailable ? null : `Room is fully booked for the selected dates (${overlappingBookings.length}/${totalUnits} units reserved).`,
    overlappingCount: overlappingBookings.length,
    totalUnits,
    capacity: room.capacity
  };
};

/**
 * Filter an array of rooms to find which ones are available for the given date range
 */
const getAvailableRoomsForDates = async (fromDate, toDate, minCapacity = 1) => {
  const checkIn = new Date(fromDate);
  const checkOut = new Date(toDate);
  checkIn.setUTCHours(0, 0, 0, 0);
  checkOut.setUTCHours(0, 0, 0, 0);

  const activeRooms = await Room.find({
    isActive: true,
    operationalStatus: { $ne: 'maintenance' },
    capacity: { $gte: Number(minCapacity) }
  }).populate('hotel');

  const availableRooms = [];

  for (const room of activeRooms) {
    const availability = await checkRoomAvailability(room._id, checkIn, checkOut);
    if (availability.isAvailable) {
      availableRooms.push({
        ...room.toObject(),
        availableUnits: availability.totalUnits - availability.overlappingCount
      });
    }
  }

  return availableRooms;
};

module.exports = {
  checkRoomAvailability,
  getAvailableRoomsForDates
};

