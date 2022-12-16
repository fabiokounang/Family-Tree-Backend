const readXlsxFile = require('read-excel-file/node');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require("express-validator");

const User = require("../model/user");
const City = require('../model/city');
const Province = require('../model/province');
const Point = require('../model/point');
const MemberCard = require('../model/membercard');

const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const processQueryParameter = require('../helper-function/process-query-parameter');
const sendResponse = require("../helper-function/send-response");
const sendEmail = require('../helper-function/send-email');

const { user_not_found, bad_request, password_wrong, token_expired, password_match, email_unique, nik_unique } = require("../utils/error-message");
const { createLog } = require('./log');
const pathDir = require('../utils/path-dir');

exports.createBulkUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  const pathFile = pathDir(req.fileUpload.filename);

  try {
    // 1) validasi request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);

    const rows = await readXlsxFile(pathFile);
    console.log(rows);

    // 2) query find user exist / tidak
    const user = await User.findOne({
      $or: [{nik: req.body.nik}, {email: req.body.email}] 
    });
    if (user) {
      if (user.nik === req.body.nik) throw new Error(nik_unique);
      if (user.email === req.body.email) throw new Error(email_unique);
    }

    const province = await Province.findById(req.body.place_of_birth);
    const city = await City.findById(req.body.city_of_residence);
    if (!province || !city) throw new Error(bad_request);
    const lastUser = await User.findOne().sort({ created_at: -1 }).limit(1).lean();
    
    let inc = null
    if (!lastUser) inc = 1;
    else inc = +lastUser.no_anggota + 1;

    // 3) create new user
    const newUser = new User({
      no_anggota: inc,
      nik: req.body.nik,
      fullname: req.body.fullname,
      email: req.body.email,
      password: req.body.password,
      gender: req.body.gender,
      status: req.body.status || 1,
      date_of_birth: req.body.date_of_birth,
      place_of_birth: req.body.place_of_birth,
      city_of_residence: req.body.city_of_residence
    });

    const result = await newUser.save();

    // const year = req.body.date_of_birth.split('-')[0];

    // const calendar = await Calendar.findOne({ status: 1 }).lean();
    // if (calendar) {
    //   calendar.calendar = JSON.parse(calendar.calendar);
    //   const month = req.body.date_of_birth.split('-')[1];
    //   const day = req.body.date_of_birth.split('-')[2];
    //   const fullname = `${req.body.first_name_latin} ${req.body.last_name_latin} (${req.body.username})`;
    //   const age = new Date().getFullYear() - year;
    //   calendar.calendar[month][day].events.push({
    //     name: `${fullname} Birthday`,
    //     description: `Today ${fullname} turns ${age}`
    //   });
    //   await Calendar.updateOne({ _id : 'calendar._id' }, {
    //     $set: {
    //       calendar: JSON.stringify(calendar.calendar)
    //     }
    //   });
    // }

    // 4) bentuk response data dan set status code = 200
    data = {
      _id: result._id,
      username: result.username,
      fullname: result.fullname,
      date_of_birth: result.date_of_birth,
      gender: result.gender,
      no_anggota: result.no_anggota
    }
    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.signupUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) validasi request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);

    // 2) query find user exist / tidak
    const user = await User.findOne({
      $or: [{nik: req.body.nik}, {email: req.body.email}] 
    });
    if (user) {
      if (user.nik === req.body.nik) throw new Error(nik_unique);
      if (user.email === req.body.email) throw new Error(email_unique);
    }

    const province = await Province.findById(req.body.place_of_birth);
    const city = await City.findById(req.body.city_of_residence);
    if (!province || !city) throw new Error(bad_request);
    const lastUser = await User.findOne().sort({ created_at: -1 }).limit(1).lean();
    
    let inc = null
    if (!lastUser) inc = 1;
    else inc = +lastUser.no_anggota + 1;

    // 3) create new user
    const newUser = new User({
      no_anggota: inc,
      nik: req.body.nik || '',
      fullname: req.body.fullname,
      email: req.body.email,
      password: req.body.password,
      gender: req.body.gender,
      status: req.body.status || 1,
      date_of_birth: req.body.date_of_birth,
      place_of_birth: req.body.place_of_birth,
      city_of_residence: req.body.city_of_residence
    });

    const result = await newUser.save();

    // const year = req.body.date_of_birth.split('-')[0];

    // const calendar = await Calendar.findOne({ status: 1 }).lean();
    // if (calendar) {
    //   calendar.calendar = JSON.parse(calendar.calendar);
    //   const month = req.body.date_of_birth.split('-')[1];
    //   const day = req.body.date_of_birth.split('-')[2];
    //   const fullname = `${req.body.first_name_latin} ${req.body.last_name_latin} (${req.body.username})`;
    //   const age = new Date().getFullYear() - year;
    //   calendar.calendar[month][day].events.push({
    //     name: `${fullname} Birthday`,
    //     description: `Today ${fullname} turns ${age}`
    //   });
    //   await Calendar.updateOne({ _id : 'calendar._id' }, {
    //     $set: {
    //       calendar: JSON.stringify(calendar.calendar)
    //     }
    //   });
    // }

    // 4) bentuk response data dan set status code = 200
    data = {
      _id: result._id,
      username: result.username,
      fullname: result.fullname,
      date_of_birth: result.date_of_birth,
      gender: result.gender,
      no_anggota: result.no_anggota
    }
    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.signinUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {

    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);

    const user = await User.findOne({ email: req.body.email }).populate({
      path: 'place_of_birth'
    });

    if (!user) {
      status = 404;
      throw new Error(user_not_found);
    }

    const isPasswordCorrect = await bcryptjs.compare(req.body.password, user.password);
    if (!isPasswordCorrect) {
      status = 403;
      throw new Error(password_wrong);
    }

    const userPoints = await Point.find({ user: user._id });
    const totalPoint = userPoints.reduce((currentValue, value) => {
      return currentValue + value.point;
    }, 0);

    const token = jwt.sign({ _id: user._id, fullname: user.fullname, status: user.status }, process.env.SECRET_KEY, { algorithm: 'HS512'}, { expiresIn: "7d" });
    let addedZero = '00000';
    let lengthPo = String(user.no_anggota).length;
    let fixNoAnggota = addedZero.slice(0, addedZero.length - lengthPo) + user.no_anggota;

    let objUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      gender: user.gender,
      status: user.status,
      token: token,
      point: totalPoint,
      no_anggota: user.place_of_birth.code + ' ' + fixNoAnggota,
      chinese_name: user.chinese_name || '',
      // address: user.address,
      // date_of_birth: user.date_of_birth,
      // first_name_latin: user.first_name_latin,
      // last_name_latin: user.last_name_latin,
      // theme: user.theme || '',
      // remark: user.remark,
      // image: user.image
    }
    data = objUser;
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.uploadImage = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);

    const user = await User.findById(req.user._id).select('image');
    if (!user) throw new Error(user_not_found);
    user.image = req.file.filename;

    await user.save();

    status = 204;
  } catch (err) {
    // console.log(err)
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.forgetPasswordUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {

    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);

    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) throw new Error(user_not_found);

    let resetToken = crypto.randomBytes(64).toString('hex');
    let passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // encrypt
    let passwordResetExpired = Date.now() + 10800000; // + 3 jam

    let [resultUpdate] = await User.updateOne({ _id: user._id }, {
      $set: {
        token_forget_password: passwordResetToken,
        expired_forget_password: passwordResetExpired
      }
    });
    if (resultUpdate.affectedRows <= 0) throw(processError(message, invalid_request, stack_forget_password));

    // send email token nya (resetToken)
    sendEmail(email, resetToken, 'resetpassword');

    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.resetPassword = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);

    if (!req.params.token) throw new error(bad_request);

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      token_forget_password: hashedToken
    });

    if (!user) throw new Error(bad_request);

    if (Date.now() > +user.expired_forget_password) throw new Error(token_expired);

    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    await User.updateOne({
      _id: user._id
    }, {
      $set: {
        password: hashedPassword
      }
    });
    status = 204;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) proses query parameter pagination etc
    if (req.user.role === 2) {
      if (req.body.filter) req.body.filter.province = req.user.province;
      else req.body.filter = { province: req.user.province }
    }

    const queryParams = processQueryParameter(req, 'created_at', ['username', 'fullname']);

    // 2) query data dan query count total
    const results = await User.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['-password', '-__v']);
    const totalDocument = await User.find(queryParams.objFilterSearch).countDocuments();
 
    // 3) bentuk response data dan set status code = 200
    data = {
      page: queryParams.page,
      limit: queryParams.limit,
      max: Math.ceil(totalDocument / queryParams.limit),
      pageSize: [10, 25, 50, 100, 200],
      total: totalDocument,
      values: results
    };
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getUserForTrees = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) proses query parameter pagination etc
    const results = await User.find({
      _id: {
        $ne: req.user._id
      }
    }).select(['-password', '-__v']);
 
    // 3) bentuk response data dan set status code = 200
    data = {
      values: results.map((user) => {
        return {
          value: user._id,
          text: user.first_name_latin + ' ' + user.last_name_latin
        }
      })
    };
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getOneUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) set id admin
    const id = req.params.id || req.user._id;
    if (!id) throw new Error(bad_request);

    // 2) query data admin by id
    const user = await User.findById(id).select(['-password', '-__v']).populate({
      path: 'place_of_birth'
    }).populate({
      path: 'city_of_residence'
    });
    if (!user) throw new Error(user_not_found);
    user.life_status = user.life_status == 1 ? 'alive' : 'dead';
    user.status = user.status == 1 ? 'active' : 'not active';
    user.gender = user.gender == 1 ? 'male' : 'female';

    const userPoints = await Point.find({ user: id });
    const total = userPoints.reduce((currentValue, value) => {
      return currentValue + value.point;
    }, 0);
    user.point = total;

    const userMemberCard = await MemberCard.findOne({
      province: req.user.place_of_birth
    }).lean();

    // 3) bentuk response data dan set status code = 200
    data = {
      ...user.toJSON(),
      membercard: userMemberCard
    }
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) validasi request body
    let errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);

    // 3) query find user by id
    let user = await User.findById(id).select(['fullname', 'email', 'chinese_name', 'place_of_birth', 'city_of_residence', 'gender', 'status']);
    if (!user) throw(user_not_found);

    //4) query update data user
    user.fullname = req.body.fullname || user.fullname;
    user.email = req.body.email || user.email;
    user.chinese_name = req.body.chinese_name || user.chinese_name;
    user.place_of_birth = req.body.place_of_birth || user.place_of_birth;
    user.city_of_residence = req.body.city_of_residence || user.city_of_residence;
    user.gender = req.body.gender || user.gender;
    user.nik = req.body.nik || user.nik;
    await user.save({validateBeforeSave: true});

    data = user.toObject();
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.changePassword = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 2) validasi request body
    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);

    // 3) query find user by id
    let user = await User.findById(req.user._id).select(['username', 'password', 'role']);
    if (!user) throw(user_not_found);

    const isPasswordCorrect = await bcryptjs.compare(req.body.old_password, user.password);
    if (!isPasswordCorrect) throw new Error(password_wrong);
    if (req.body.new_password != req.body.confirmation_password) throw new Error(password_match);

    //4) query update password user
    user.password = req.body.new_password || user.password;
    await user.save({validateBeforeSave: true});

    status = 204;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updatePasswordUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) validasi request body
    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);

    // 3) query find admin by id
    let user = await User.findById(id).select(['fullname', 'email', 'role', 'password']);
    if (!user) throw(user_not_found);
    sendEmail(user.email, req.body.password);
    user.password = req.body.password || user.password;
    await user.save({validateBeforeSave: true});

    createLog(req.user._id, 'update password user');
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateTokenFcm = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id user
    const id = req.user._id;

    // 2) validasi request body
    if (!req.body.token) throw new Error(bad_request);

    // 3) query find user by id
    let user = await User.findById(id).select(['username', 'role']);
    if (!user) throw(user_not_found);

    if (!user.token_fcm) {
      user.token_fcm = req.body.token || user.token_fcm;
      await user.save({validateBeforeSave: true});
    }

    data = user.toObject();
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) query delete admin by id
    await User.deleteOne({ _id: id });

    status = 204;

    createLog(req.user._id, 'delete user');

  } catch (err) {
    console.log(err)
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.signoutUser = async (req, res, next) => {
  try {
    sendResponse(res, 200);
  } catch (error) {
    sendResponse(res, 200);
  }
}