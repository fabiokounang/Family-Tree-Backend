const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hashingPassword = require('../helper-function/hashing-password');

const { fullname_required, password_required, status_required, gender_required, address_required, no_anggota_required, last_name_latin_required, first_name_latin_required, chinese_name_required, place_of_birth_required, phone_required, date_of_birth_required, nik_required } = require('../utils/error-message');

const userSchema = new Schema({
  fullname: {
    type: String,
    required: [true, fullname_required],
    trim: true
  },
  nik: {
    type: String,
    required: [true, nik_required],
    trim: true,
    unique: true,
    length: 16
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
  // first_name_latin: {
  //   type: String,
  //   required: [true, first_name_latin_required],
  //   maxlength: 200,
  //   trim: true
  // },
  // last_name_latin: {
  //   type: String,
  //   required: [true, last_name_latin_required],
  //   maxlength: 200,
  //   trim: true
  // },
  // chinese_name: {
  //   type: String,
  //   maxlength: 200,
  //   trim: true
  // },
  // life_status: {
  //   type: Number,
  //   default: 1 // 1 alive, 2 dead
  // },
  gender: {
    type: Number, // 1 = male, 2 = female
    required: [true, gender_required],
  },
  // image: {
  //   type: String
  // },
  // address: {
  //   type: String,
  //   required: [true, address_required],
  //   maxlength: 300,
  //   trim: true
  // },
  // date_of_birth: {
  //   type: String,
  //   required: [true, date_of_birth_required],
  //   trim: true
  // },
  email: {
    type: String,
    trim: true
  },
  // phone: {
  //   type: String,
  //   required: [true, phone_required],
  //   minlength: 10,
  //   maxlength: 14,
  //   trim: true
  // },
  // wechat: {
  //   type: String,
  //   trim: true
  // },
  place_of_birth: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, place_of_birth_required],
    ref: 'province'
  },
  city_of_residence: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, place_of_birth_required],
    ref: 'city'
  },
  // postal_address: {
  //   type: String,
  //   maxlength: 6,
  //   trim: true
  // },
  // remark: {
  //   type: String
  // },
  // theme: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'theme'
  // },
  token_forget_password: {
    type: String,
    default: null
  },
  expired_forget_password: {
    type: Number,
    default: null
  },
  token_fcm: {
    type: String,
    default: null
  },
  created_at: {
    type: String,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('nomor_anggota').get(function () {
  let addedZero = '00000';
  let lengthNoAnggota = String(this.no_anggota).length;
  let fixNoAnggota = addedZero.slice(0, addedZero.length - lengthNoAnggota) + this.no_anggota;
  return fixNoAnggota;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = hashingPassword(this.password);
  next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;