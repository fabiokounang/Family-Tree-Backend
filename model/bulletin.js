const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { title_required, subtitle_required, image_required, description_required, status_required } = require('../utils/error-message');

const bulletinSchema = new Schema({
  title: {
    type: String,
    required: [true, title_required],
    trim: true,
    maxlength: 255,
  },
  subtitle: {
    type: String,
    required: [true, subtitle_required],
    trim: true,
    maxlength: 500
  },
  image: {
    type: String,
    required: [true, image_required]
  },
  cloudinary: {
    type: String,
    required: [true, image_required]
  },
  description: {
    type: String,
    required: [true, description_required],
    maxlength: 1500
  },
  status: {
    type: Number,
    required: [true, status_required],
    default: 1 // 1 aktif, 2 non aktif
  },
  created_at: {
    type: String,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Bulletin = mongoose.model('bulletin', bulletinSchema);

module.exports = Bulletin;