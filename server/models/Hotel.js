const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hotel name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide hotel description']
    },
    address: {
      type: String,
      required: [true, 'Please provide address'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
      default: 'United States',
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    amenities: {
      type: [String],
      default: ['High-speed Wi-Fi', 'Swimming Pool', 'Spa & Wellness', 'Valet Parking', 'Fine Dining Restaurant', '24/7 Room Service', 'Fitness Center']
    },
    images: {
      type: [String],
      default: []
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

module.exports = mongoose.model('Hotel', hotelSchema);

