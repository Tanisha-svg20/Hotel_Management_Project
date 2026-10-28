const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['housekeeping', 'maintenance', 'room_service', 'amenities', 'other'],
      default: 'housekeeping'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    description: {
      type: String,
      required: [true, 'Please provide request description'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
      default: 'pending'
    },
    resolutionNotes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

serviceRequestSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
