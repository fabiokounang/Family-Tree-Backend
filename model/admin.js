const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hashingPassword = require('../helper-function/hashing-password');

const { username_required, password_required, status_required } = require('../utils/error-message');

const adminSchema = new Schema({
  username: {
    type: String,
    required: [true, username_required],
    maxlength: 30,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, password_required],
    minlength: 8,
    trim: true
  },
  role: {
    type: Number, // 1 superadmin, 2 admin
  },
  status: {
    type: Number,
    required: [true, status_required],
    default: 1 // 1 active & 2 non active
  },
  created_at: {
    type: String,
    default: Date.now
  }
});

adminSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = hashingPassword(this.password);
  next();
});

const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;