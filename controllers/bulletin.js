const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const processQueryParameter = require('../helper-function/process-query-parameter');
const sendResponse = require("../helper-function/send-response");
const Bulletin = require("../model/bulletin");
const { bulletin_unique, bulletin_not_found } = require("../utils/error-message");
const { createLog } = require("./log");

// Bulletin.deleteMany().then(() => {})

exports.createBulletin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const bulletin = await Bulletin.findOne({ title: req.body.title });
    if (bulletin) throw new Error(bulletin_unique);

    const newBulletin = new Bulletin({
      title: req.body.title,
      subtitle: req.body.subtitle,
      image: req.file.filename,
      description: req.body.description,
      status: req.body.status || 1
    });

    await newBulletin.save();

    createLog(req.user._id, 'create bulletin');

    data = {
      _id: newBulletin._id,
      title: newBulletin.title
    }
    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateBulletin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const bulletin = await Bulletin.findById(req.params.id);
    if (!bulletin) throw new Error(bulletin_not_found);

    bulletin.title = req.body.title || bulletin.title;
    bulletin.subtitle = req.body.subtitle || bulletin.subtitle;
    bulletin.image = req.file.filename || bulletin.image;
    bulletin.description = req.body.description || bulletin.description;
    bulletin.status = req.body.status || bulletin.status;

    await bulletin.save();

    createLog(req.user._id, 'update bulletin');

    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteBulletin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    await Bulletin.deleteOne({ _id: req.params.id});
    status = 204;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllBulletin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', ['title', 'subtitle']);

    // 2) query data dan query count total
    const results = await Bulletin.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['-password', '-__v']);
    const totalDocument = await Bulletin.find(queryParams.objFilterSearch).countDocuments();
 
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