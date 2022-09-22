const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin'
  },
  action: {
    type: String,
    required: true
  },
  created_at: {
    type: String,
    default: Date.now
  }
});

const Log = mongoose.model('log', logSchema);

module.exports = Log;