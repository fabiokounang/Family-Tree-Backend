const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hashingPassword = require('../helper-function/hashing-password');

const { fullname_required, password_required, status_required, gender_required, address_required, no_anggota_required, last_name_latin_required, first_name_latin_required, chinese_name_required, place_of_birth_required, phone_required, date_of_birth_required, nik_required, email_required } = require('../utils/error-message');

const userSchema = new Schema({
  fullname: {
    type: String,
    required: [true, fullname_required],
    trim: true
  },
  nik: {
    type: String,
    trim: true,
    length: 16
  },
  password: {
    type: String,
    required: [true, password_required],
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
  chinese_name: {
    type: String,
    maxlength: 200,
    trim: true
  },
  gender: {
    type: Number, // 1 = male, 2 = female
    required: [true, gender_required],
  },
  email: {
    type: String,
    trim: true,
    required: [true, email_required]
  },
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
  console.log(this.password)
  this.password = hashingPassword(this.password);
  next();
});

userSchema.pre('insertMany', async function (next, docs) {
  if (Array.isArray(docs) && docs.length > 0) {
    const users = docs.map((user) => {
      user.password = hashingPassword(user.password);
      return user;
    });
    docs = users;
  }
  next();
});


const User = mongoose.model('user', userSchema);

module.exports = User;