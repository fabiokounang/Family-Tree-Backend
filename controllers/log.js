const handleError = require("../helper-function/handle-error");
const processQueryParameter = require("../helper-function/process-query-parameter");
const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");
const Log = require("../model/log");

exports.createLog = async (userId, action) => {
  try {
    const log = new Log({
      user: userId,
      action: action
    });
    
    await log.save();    
  } catch (err) {
    console.log(err, 'Error create log + ' + { userId, action });
  }
}

exports.getAllLog = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', ['username']);

    // 2) query data dan query count total
    const results = await Log.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['user', 'action', 'created_at']).populate({
      path: 'user',
      select: 'username'
    });
    const totalDocument = await Log.find(queryParams.objFilterSearch).countDocuments();

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