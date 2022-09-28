const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const provinceSchema = new Schema({
  code: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true,
    lowercase: true
  },
  created_at: {
    type: String,
    default: Date.now
  }
});

const Province = mongoose.model('province', provinceSchema);

module.exports = Province;