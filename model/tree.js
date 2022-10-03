const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const treeSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  created_at: {
    type: String,
    default: Date.now
  }
});

const Tree = mongoose.model('tree', treeSchema);

module.exports = Tree;