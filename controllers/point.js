const Point = require('../model/point');

const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");
const processQueryParameter = require('../helper-function/process-query-parameter');

exports.getUserPoint = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    const userPoints = await Point.find({ user: req.user._id });
    const total = userPoints.reduce((currentValue, value) => {
      return currentValue + value.point;
    }, 0);

    // 3) bentuk response data dan set status code = 200
    data = {
      total
    };
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getUserPointByAdmin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    const userPoints = await Point.find({ user: req.params.id });
    const total = userPoints.reduce((currentValue, value) => {
      return currentValue + value.point;
    }, 0);

    // 3) bentuk response data dan set status code = 200
    data = {
      total
    };
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getUserHistoryPoint = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', ['occasion']);

    // 2) query data dan query count total
    const results = await Point.find({user: req.user._id, ...queryParams.objFilterSearch}).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['-__v']);
    const totalDocument = await Point.find({user: req.user._id, ...queryParams.objFilterSearch}).countDocuments();
    
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

exports.getAllUserHistoryPoint = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', ['occasion']);

    // 2) query data dan query count total
    const results = await Point.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['-__v']).populate({
      path: 'user',
      select: ['username']
    }).populate({
      path: 'occasion',
      select: ['title', 'type']
    });
    const totalDocument = await Point.find(queryParams.objFilterSearch).countDocuments();
    
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