const Occasion = require('../model/occasion');

const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");
const processQueryParameter = require('../helper-function/process-query-parameter');

const { occasion_unique, bad_request, occasion_not_found } = require('../utils/error-message');
const { validationResult } = require('express-validator');

exports.createOccasion = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(bad_request);

    const occasion = await Occasion.findOne({ title: req.body.title });
    if (occasion) throw new Error(occasion_unique);

    const newOccasion = new Occasion({
      title: req.body.title,
      expired_date: req.body.expired_date
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

    status = 201;
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