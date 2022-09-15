const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require("../model/user");

const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");
const handleError = require("../helper-function/handle-error");

const { auth, user_not_found, user_not_active } = require("../utils/error-message");

module.exports = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    if (req.cookies.authorization) {
      const token = req.cookies.authorization.split('Bearer ')[1]; // token
      if (!token) return helperResponse(error);
      const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
      const user = await User.findById(decoded._id);
      if (!user) throw new Error(user_not_found);
      if (user.status != 1) throw new Error(user_not_active);
      req.user = user;
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