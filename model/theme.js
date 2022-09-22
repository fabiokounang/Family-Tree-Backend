const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { theme_required, color_required, status_required } = require('../utils/error-message');

const themeSchema = new Schema({
  theme: {
    type: String,
    required: [true, theme_required],
    maxlength: 30,
    unique: true,
    lowercase: true,
    trim: true
  },
  color: {
    type: String,
    required: [true, color_required],
    trim: true
  },
  text: {
    type: String,
    required: [true, color_required],
    trim: true
  },
  status: {
    type: Number,
    required: [true, status_required],
    default: 1 // active & non active
  },
  created_at: {
    type: String,
    default: Date.now
  }
});

const Theme = mongoose.model('theme', themeSchema);

module.exports = Theme;