const mongoose = require('mongoose');
const { status_required, image_required, province_required } = require('../utils/error-message');
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
  image: {
    type: String,
    required: [true, image_required]
  },
  cloudinary: {
    type: String,
    required: [true, image_required]
  },
  status: {
    type: Number,
    required: [true, status_required],
    default: 1 // 1 aktif, 2 non aktif
  },
  province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'province',
    required: [true, province_required]
  },
  created_at: {
    type: String,
    default: Date.now
  }
});

const Banner = mongoose.model('banner', bannerSchema);

module.exports = Banner;