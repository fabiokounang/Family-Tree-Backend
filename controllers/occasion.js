const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');

const Occasion = require('../model/occasion');
const User = require('../model/user');

const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");
const processQueryParameter = require('../helper-function/process-query-parameter');

const { occasion_unique, bad_request, occasion_not_found, user_not_found, password_wrong, point_not_enough, already_registered, occasion_expired } = require('../utils/error-message');
const Point = require('../model/point');

exports.createOccasion = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(bad_request);

    const occasion = await Occasion.findOne({ title: req.body.title });
    if (occasion) throw new Error(occasion_unique);

    const newOccasion = new Occasion({
      title: req.body.title,
      expired_date: req.body.expired_date,
      type: req.body.type,
      point: req.body.point
    });

    await newOccasion.save();

    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.registerUserOccasion = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) validasi request user
    const id = req.params.id;
    if (!id) throw new Error(bad_request);
    const errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 2) find by username
    const user = await User.findOne({ username: req.body.username });
    if (!user) throw new Error(user_not_found);

    // 3) cek password
    const isPasswordCorrect = await bcryptjs.compare(req.body.password, user.password);
    if (!isPasswordCorrect) throw new Error(password_wrong);

    // 4) find occasion, cek expire
    const occasion = await Occasion.findById(id);
    if (!occasion) throw new Error(occasion_not_found);
    if (occasion.status != 1) throw new Error(occasion_expired);
    if (Date.now() > occasion.expired_date) throw new Error(occasion_expired);

    // 5) find point history, cek duplicate
    const isRegistered = await Point.findOne({ user: user._id, occastion: occasion._id });
    if (isRegistered) throw new Error(already_registered);

    // 6) if type potong point, cek user saldo balance enough / no
    if (occasion.type == 2) {
      const userPoints = await Point.find({ user: user._id });
      const total = userPoints.reduce((currentValue, value) => {
        return currentValue + value.point;
      }, 0);
      if (total - (occasion.point * 1) < 0) throw new Error(point_not_enough);
    }

    // 7) create point user
    await Point.create({
      point: occasion.type == 1 ? occasion.point : occasion.point * -1,
      user: user._id,
      occasion: occasion._id
    });
    
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateOccasion = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    const id = req.params.id;
    const occasion = await Occasion.findById(id);
    if (!occasion) throw new Error(occasion_not_found);

    occasion.title = req.body.title || occasion.title;
    occasion.type = req.body.type || occasion.type;
    occasion.point = req.body.point || occasion.point;
    occasion.expired_date = req.body.expired_date || occasion.expired_date;

    await occasion.save();

    status = 204;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteOccasion = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    await Occasion.deleteOne({ _id: req.params.id });

    status = 204;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllOccasion = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', ['title']);

    // 2) query data dan query count total
    const results = await Occasion.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['-__v']);
    const totalDocument = await Occasion.find(queryParams.objFilterSearch).countDocuments();

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