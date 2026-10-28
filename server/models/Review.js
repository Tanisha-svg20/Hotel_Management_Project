const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    title: {
      type: String,
      trim: true
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

