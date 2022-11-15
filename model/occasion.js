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
  // type: {
  //   type: Number,
  //   required: true // 1 add poin, 2 decrease poin
  // },
  scope: {
    type: Number,
    required: true, // 1 local add point, 2 local decrease point, 3 nasional decrease point
  },
  province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'province'
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
  return Date.now() < this.expired_date ? 1 : 2;
});

const Occasion = mongoose.model('occasion', occasionSchema);

module.exports = Occasion;