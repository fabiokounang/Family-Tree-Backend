const webpush = require('web-push');

const Broadcast = require('../model/broadcast');

const handleError = require("../helper-function/handle-error");
const returnData = require('../helper-function/return-data');
const sendResponse = require('../helper-function/send-response');
const { createLog } = require('./log');

const { bad_request } = require('../utils/error-message');
const { validationResult } = require('express-validator');
const vapidKeys = { // new
  publicKey: process.env.PUBLIC_KEY, // new
  privateKey: process.env.PRIVATE_KEY // new
}
webpush.setVapidDetails('mailto:fabiokounang11@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

exports.saveSubscription = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    const subscription = req.body;
    const result = await new Broadcast(subscription);
    await result.save();
    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.pushNotification = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(bad_request);
    
    const subscriptions = await Broadcast.find({ users: req.body.users });
    const notificationPayload = {
      "notification": {
          "title": req.body.title,
          "body": req.body.body,
          "icon": "assets/main-page-logo-small-hat.png",
          "vibrate": [100, 50, 100],
          "data": {
            "dateOfArrival": Date.now(),
            "primaryKey": 1
          },
          "actions": [{
            "action": "Explore",
            "title": "Go to application"
          }
        ]
      }
    };
    Promise.all(subscriptions.map(sub => webpush.sendNotification(
      sub, JSON.stringify(notificationPayload) )))
      .then(() => {
        console.log('Success send notifications')
      }).catch(err => {
        console.error("Error sending notification, reason: ", err);
        // res.sendStatus(500);
      });
      
    status = 201;

    createLog(req.user._id, 'create broadcast');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}
