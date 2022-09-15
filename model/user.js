const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hashingPassword = require('../helper-function/hashing-password');

const { username_required, password_required, status_required, gender_required, address_required, no_anggota_required, last_name_latin_required, first_name_latin_required, chinese_name_required, place_of_birth_required, phone_required, date_of_birth_required } = require('../utils/error-message');

const userSchema = new Schema({
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
    minlength: 6,
    maxlength: 16,
    trim: true
  },
  status: {
    type: Number,
    required: [true, status_required],
    default: 1 // active & non active
  },
  no_anggota: {
    type: String,
    required: [true, no_anggota_required]
  },
  first_name_latin: {
    type: String,
    required: [true, first_name_latin_required],
    maxlength: 200,
    lowercase: true,
    trim: true
  },
  last_name_latin: {
    type: String,
    required: [true, last_name_latin_required],
    maxlength: 200,
    lowercase: true,
    trim: true
  },
  chinese_name: {
    type: String,
    required: [true, chinese_name_required],
    maxlength: 200,
    trim: true
  },
  life_status: {
    type: Number,
    default: 1 // 1 alive, 2 dead
  },
  gender: {
    type: Number, // 1 = male, 2 = female
    required: [true, gender_required],
  },
  image: {
    type: String
  },
  address: {
    type: String,
    required: [true, address_required],
    maxlength: 300,
    trim: true
  },
  date_of_birth: {
    type: String,
    required: [true, date_of_birth_required],
    trim: true
  },
  place_of_birth: {
    type: String,
    required: [true, place_of_birth_required],
    trim: true
  },
  phone: {
    type: String,
    required: [true, phone_required],
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  wechat: {
    type: String,
    trim: true
  },
  city_of_residence: {
    type: String,
    trim: true
  },
  postal_address: {
    type: String,
    maxlength: 6,
    trim: true
  },
  remark: {
    type: String
  },
  created_at: {
    type: String,
    default: Date.now
  }
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = hashingPassword(this.password);
  next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;