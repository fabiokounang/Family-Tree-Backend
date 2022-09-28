const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');

const Admin = require("../model/admin");
const Province = require('../model/province');

const handleError = require("../helper-function/handle-error");
const processErrorForm = require("../helper-function/process-error-form");
const processQueryParameter = require('../helper-function/process-query-parameter');
const returnData = require('../helper-function/return-data');
const sendResponse = require('../helper-function/send-response');
const { createLog } = require('./log');

const { username_unique, bad_request, admin_not_found, password_wrong, province_required } = require("../utils/error-message");


exports.createAdmin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) validasi request body
    const errors = validationResult(req);   
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 2) query find admin exist / tidak
    const admin = await Admin.findOne({ username: req.body.username });
    if (admin) throw new Error(username_unique);

    const provinces = await Province.find({
      '_id': { 
        $in: req.body.province
      }
    });
    if (provinces.length != req.body.province.length) throw new Error(bad_request);
    if (req.body.role == 2) {
      if (!req.body.province || req.body.province.length == 0) throw new Error(province_required);
    }

    // 3) create new admin
    const newAdmin = new Admin({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
      province: req.body.province
    });

    const result = await newAdmin.save();

    // 4) bentuk response data dan set status code = 200
    data = {
      _id: result._id,
      username: result.username,
      role: result.role
    }
    status = 201;

    createLog(req.user._id, 'create admin');

  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.signinAdmin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {

    let errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(bad_request);

    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) throw new Error(admin_not_found);
    const isPasswordCorrect = await bcryptjs.compare(req.body.password, admin.password);
    if (!isPasswordCorrect) throw new Error(password_wrong);

    const token = jwt.sign({ _id: admin._id, username: admin.username, role: admin.role }, process.env.SECRET_KEY, { algorithm: 'HS512'}, { expiresIn: "7d" });
    let objAdmin = {
      _id: admin._id,
      username: admin.username,
      role: admin.role,
      status: admin.status,
      created_at: admin.created_at,
      token: token
    }

    // sendCookie('admin', req, res, token);

    data = objAdmin;
    status = 200;

    createLog(admin._id, 'signin admin');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllAdmin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', ['username']);

    // 2) query data dan query count total
    const results = await Admin.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['username', 'status', 'role', 'province', 'created_at']).populate({
      path: 'province',
      select: ['code', 'province']
    });
    
    const province = await Province.find().select('-__v');
    const totalDocument = await Admin.find(queryParams.objFilterSearch).countDocuments();
    // 3) bentuk response data dan set status code = 200
    data = {
      page: queryParams.page,
      limit: queryParams.limit,
      max: Math.ceil(totalDocument / queryParams.limit),
      pageSize: [10, 25, 50, 100, 200],
      total: totalDocument,
      values: results,
      province: province.map((val) => {
        return {
          id: val._id,
          name: val.province
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

exports.getOneAdmin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) query data admin by id
    const admin = await Admin.findById(id).select(['_id', 'username', 'status', 'role', 'created_at']);
    if (!admin) throw new Error(admin_not_found);

    // 3) bentuk response data dan set status code = 200
    data = admin.toObject();
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateAdmin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) validasi request body
    let errors = validationResult(req);    
    if (!errors.isEmpty()) {
      error.msg = processErrorForm(errors.array());
      throw(error);
    }

    // 3) query find admin by id
    let admin = await Admin.findById(id).select(['username', 'role']);
    if (!admin) throw(admin_not_found);

    //4) query update data admin
    admin.username = req.body.username || admin.username;
    admin.role = req.body.role || admin.role;

    await admin.save({validateBeforeSave: true});
    data = admin.toObject();
    status = 200;

    createLog(req.user._id, 'update data admin');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
} 

exports.updatePassword = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) validasi request body
    let errors = validationResult(req);    
    if (!errors.isEmpty()) {
      error.msg = processErrorForm(errors.array());
      throw(error);
    }

    let admin = await Admin.findById(id).select(['password, role']);
    if (!admin) throw(admin_not_found);

    // // proses update data admin
    admin.password = req.body.password || admin.password;
    await admin.save({validateBeforeSave: true});

    status = 200;

    createLog(req.user._id, 'update password admin');
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
    // 1) set id admin login
    const id = req.user._id;

    // 2) validasi request body
    let errors = validationResult(req);    
    if (!errors.isEmpty()) {
      error.msg = processErrorForm(errors.array());
      throw(error);
    }

    let admin = await Admin.findById(id).select(['password, role']);
    if (!admin) throw(admin_not_found);

    // proses update data admin
    admin.password = req.body.password || admin.password;
    await admin.save({validateBeforeSave: true});

    status = 200;

    createLog(req.user._id, 'change password admin (self)');

  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateStatus = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) validasi request body
    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 3) query find admin by id
    let admin = await Admin.findById(id).select(['status role']);
    if (!admin) throw(admin_not_found);


    // deactivate status
    admin.status = req.body.status || admin.status;
    await admin.save({validateBeforeSave: true});
    
    status = 200;
    createLog(req.user._id, 'update status admin');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteAdmin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);
    if (id == req.user._id) throw new Error(bad_request);

    // 2) query delete admin by id
    await Admin.deleteOne({ _id: id });

    status = 204;

    createLog(req.user._id, 'delete admin');

  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
} 

exports.getLogin = (req, res, next) => {
  let resp = {
    _id: req.userData._id,
    username: req.userData.username,
    role: req.userData.role,
    status: req.userData.status
  }
  sendResponse(res, true, resp);
}

exports.signoutAdmin = async (req, res, next) => {
  try {
    // sendCookie('admin', req, res, '', true);
    sendResponse(res, 200);
  } catch (error) {
    sendResponse(res, 200);
  }
}