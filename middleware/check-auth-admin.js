const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const Admin = require("../model/admin");

const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");
const handleError = require("../helper-function/handle-error");

const { auth, admin_not_active } = require("../utils/error-message");

module.exports = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split('Bearer ')[1]; // token
      if (!token) return helperResponse(error);
      const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
      const admin = await Admin.findById(decoded._id);
      if (!admin) throw new Error(auth);
      if (admin.status != 1) throw new Error(admin_not_active);
      req.user = admin;
      status = 200;
    } else {
      throw new Error(auth);
    }
  } catch (err) {
    status = 401;
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    if (status === 200) return next();
    sendResponse(res, status, data, error, stack);
  }
}