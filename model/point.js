const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const pointSchema = new Schema({
  point: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  occasion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'occasion'
  },
  created_at: {
    type: String,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Point = mongoose.model('point', pointSchema);

module.exports = Point;