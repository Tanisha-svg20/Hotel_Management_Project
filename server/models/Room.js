const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel'
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number or identifier'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Please select room type'],
      enum: ['Single', 'Double', 'Deluxe', 'Suite', 'Family Suite', 'Presidential Suite']
    },
    description: {
      type: String,
      required: [true, 'Please provide room description']
    },
    rent: {
      type: Number,
      required: [true, 'Please provide nightly rent/price'],
      min: [0, 'Rent must be positive']
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify guest capacity'],
      min: [1, 'Capacity must be at least 1 person'],
      default: 2
    },
    amenities: {
      type: [String],
      default: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'En-suite Bathroom', 'Room Service']
    },
    photos: {
      type: [String],
      default: []
    },
    operationalStatus: {
      type: String,
      enum: ['available', 'occupied', 'cleaning', 'maintenance'],
      default: 'available'
    },
    count: {
      type: Number,
      default: 1,
      min: 1
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index roomNumber and type for faster searching
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ type: 1, rent: 1 });

module.exports = mongoose.model('Room', roomSchema);
