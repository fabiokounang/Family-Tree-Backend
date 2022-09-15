const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { title_required, description_required, user_broadcast_required } = require('../utils/error-message');

const broadcastSchema = new Schema({
  endpoint: {
    type: String,
    required: [true, description_required],
    trim: true
  },
  keys: {
    p256dh: {
      type: String
    },
    auth: {
      type: String
    }
  },
  userId: [
    {
      type: mongoose.Schema.Types.ObjectId,
    required: true
    }
  ],
  created_at: {
    type: String,
    default: Date.now
  }
});

const Broadcast = mongoose.model('broadcast', broadcastSchema);

module.exports = Broadcast;