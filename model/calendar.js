const mongoose = require('mongoose');
const { calendar_name_required, province_required } = require('../utils/error-message');
const Schema = mongoose.Schema;


const calendarSchema = new Schema({
  name: {
    type: String,
    required: [true, calendar_name_required]
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  },
  calendar: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: 2 // 1 aktif, 2 non aktif
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

const Calendar = mongoose.model('calendar', calendarSchema);

module.exports = Calendar;