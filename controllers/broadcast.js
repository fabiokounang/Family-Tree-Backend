const webpush = require('web-push');
const axios = require('axios');

const User = require('../model/user');
const Broadcast = require('../model/broadcast');

const handleError = require("../helper-function/handle-error");
const returnData = require('../helper-function/return-data');
const sendResponse = require('../helper-function/send-response');
const { createLog } = require('./log');

exports.sendFcm = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    const users = await User.find({ 
      _id: {
        $in: req.body.users
      },
      token_fcm: {
        $ne: null
      }
    });

    if (users.length > 0) {
      users.forEach(async (user) => {
        const objFcm = {
          "to" : user.token_fcm,
          "collapse_key" : "type_a",
          "notification" : {
            "body" : req.body.body,
            "title": req.body.title
          }
        }
        const response = await axios({
          method: 'POST',
          url: process.env.FCM_URL,
          headers: {
            'Authorization': 'key=' + process.env.FCM_SERVER_KEY,
            'Content-Type': 'application/json'
          },
          data: objFcm
        });
      });
    }

    status = 201;
    createLog(req.user._id, 'create broadcast');
    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}