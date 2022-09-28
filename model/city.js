const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citySchema = new Schema({
  code: {
    type: String,
    required: true
  },
  provinceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'province'
  },
  city: {
    type: String,
    required: true,
    lowercase: true
  },
  created_at: {
    type: String,
    default: Date.now
  }
});

const City = mongoose.model('city', citySchema);

module.exports = City;