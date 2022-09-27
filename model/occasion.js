const mongoose = require('mongoose');
const { expired_date_required, title_required } = require('../utils/error-message');
const Schema = mongoose.Schema;


const occasionSchema = new Schema({
  title: {
    type: String,
    required: [true, title_required],
    unique: true,
    maxlength: 200
  },
  type: {
    type: Number,
    required: true // 1 add poin, 2 decrease poin
  },
  point: {
    type: Number,
    required: true
  },
  expired_date: {
    type: Number,
    required: [true, expired_date_required]
  },
  created_at: {
    type: String,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

occasionSchema.virtual('status').get(function() {
  return Date.now() < this.created_at ? 1 : 2;
});


const Occasion = mongoose.model('occasion', occasionSchema);

module.exports = Occasion;