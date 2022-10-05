const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require("express-validator");

const User = require("../model/user");
const City = require('../model/city');
const Province = require('../model/province');

const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const processQueryParameter = require('../helper-function/process-query-parameter');
const sendResponse = require("../helper-function/send-response");

const { user_unique, user_not_found, bad_request, password_wrong, token_expired, password_match } = require("../utils/error-message");
const sendEmail = require('../helper-function/send-email');
const Point = require('../model/point');

exports.signupUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) validasi request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 2) query find user exist / tidak
    const user = await User.findOne({ username: req.body.username, email: req.body.email, phone: req.body.phone, wechat: req.body.wechat });
    if (user) throw new Error(user_unique);

    const province = await Province.findById(req.body.place_of_birth);
    const city = await City.findById(req.body.city_of_residence);
    if (!province || !city) throw new Error(bad_request);
    const lastUser = await User.findOne().sort({ created_at: -1 }).limit(1);
    
    let inc = null
    if (!lastUser) inc = 1;
    else inc = +lastUser.no_anggota.slice(2) + 1;

    const genderNo = req.body.gender ? 1 : 0;
    const provinceNo = province.code;
    const cityNo = city.code;
    const incrementNumber = inc;

    const anggotaNum = `${provinceNo}${incrementNumber}`;

    // 3) create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      gender: req.body.gender,
      status: req.body.status || 1,
      first_name_latin: req.body.first_name_latin,
      last_name_latin: req.body.last_name_latin,
      chinese_name: req.body.chinese_name,
      life_status: req.body.life_status,
      address: req.body.address,
      date_of_birth: req.body.date_of_birth,
      place_of_birth: req.body.place_of_birth,
      phone: req.body.phone,
      wechat: req.body.wechat,
      city_of_residence: req.body.city_of_residence,
      postal_address: req.body.postal_address,
      remark: req.body.remark,
      no_anggota: anggotaNum
    });

    const result = await newUser.save();

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
    if (!errors.isEmpty()) throw new Error(bad_request);

    const user = await User.findOne({ username: req.body.username });
    if (!user) throw new Error(user_not_found);

    const isPasswordCorrect = await bcryptjs.compare(req.body.password, user.password);
    if (!isPasswordCorrect) throw new Error(password_wrong);

    const userPoints = await Point.find({ user: user._id });
    const totalPoint = userPoints.reduce((currentValue, value) => {
      return currentValue + value.point;
    }, 0);

    const token = jwt.sign({ _id: user._id, username: user.username, status: user.status }, process.env.SECRET_KEY, { algorithm: 'HS512'}, { expiresIn: "7d" });
    let objUser = {
      _id: user._id,
      username: user.username,
      address: user.address,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      first_name_latin: user.first_name_latin,
      last_name_latin: user.last_name_latin,
      chinese_name: user.chinese_name,
      status: user.status,
      no_anggota: user.no_anggota,
      theme: user.theme || '',
      token: token,
      point: totalPoint,
      remark: user.remark,
      image: user.image
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
    if (!errors.isEmpty()) throw new Error(bad_request);

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
    if (!errors.isEmpty()) throw new Error(bad_request);

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
    if (!errors.isEmpty()) throw new Error(bad_request);

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

exports.getOneUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) set id admin
    const id = req.params.id || req.user._id;
    if (!id) throw new Error(bad_request);

    // 2) query data admin by id
    const user = await User.findById(id).select(['-password', '-__v']).lean();
    if (!user) throw new Error(user_not_found);
    const province = await Province.findById(user.place_of_birth);
    const city = await City.findById(user.city_of_residence);
    user.place_of_birth = province.province;
    user.city_of_residence = city.city;
    user.life_status = user.life_status == 1 ? 'alive' : 'dead';
    user.status = user.status == 1 ? 'active' : 'not active';
    user.gender = user.gender == 1 ? 'male' : 'female';

    const userPoints = await Point.find({ user: id });
    const total = userPoints.reduce((currentValue, value) => {
      return currentValue + value.point;
    }, 0);
    user.point = total;

    // 3) bentuk response data dan set status code = 200
    data = user;
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
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 3) query find admin by id
    let user = await User.findById(id).select(['username', 'role']);
    if (!user) throw(user_not_found);

    let beforeUser = JSON.stringify(user);

    //4) query update data admin
    user.username = req.body.username || user.username;
    user.fullname = req.body.fullname || user.fullname;
    user.address = req.body.address || user.address;
    user.date_of_birth = req.body.date_of_birth || user.date_of_birth;
    user.gender = req.body.gender || user.gender;
    await user.save({validateBeforeSave: true});

    // beforeAdmin = JSON.parse(beforeAdmin);
    // let beforeData = {
    //   username: beforeAdmin.username,
    //   toko: beforeAdmin.toko,
    //   role: beforeAdmin.role
    // }

    // let afterData = {
    //   username: admin.username,
    //   toko: req.toko,
    //   role: admin.role
    // }

    // let objLog = generateDataLog(req.userData.username, 'log.update_admin', req.userData.role, beforeData, afterData);
    // await log.createLog(objLog);
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
    if (!errors.isEmpty()) throw new Error(bad_request);

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
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 3) query find admin by id
    let user = await User.findById(id).select(['username', 'role', 'password']);
    if (!user) throw(user_not_found);

    user.password = req.body.password || user.password;
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

exports.signoutUser = async (req, res, next) => {
  try {
    sendResponse(res, 200);
  } catch (error) {
    sendResponse(res, 200);
  }
}