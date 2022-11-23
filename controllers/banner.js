const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

const Banner = require("../model/banner");

const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const processQueryParameter = require('../helper-function/process-query-parameter');

const sendResponse = require("../helper-function/send-response");

const { createLog } = require("./log");
const { banner_not_found, vendor_error } = require("../utils/error-message");

exports.createBanner = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const newBanner = new Banner({
      image: req.resultFile,
      cloudinary: req.public_id,
      status: req.body.status || 1
    });

    await newBanner.save();

    createLog(req.user._id, 'create banner');

    data = {
      _id: newBanner._id
    }
    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateBanner = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) throw new Error(banner_not_found);

    banner.image = req.resultFile || banner.image;
    banner.cloudinary = req.public_id || banner.cloudinary;
    banner.status = req.body.status || banner.status;

    await banner.save();

    createLog(req.user._id, 'update banner');

    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteBanner = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  if (process.env.NODE_ENV === 'production') {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const id = req.params.id;
      const banner = await Banner.findById(id);
      if (banner) {
        const cloudinaryDelete = await cloudinary.api.delete_resources([banner.cloudinary]);
        if (cloudinaryDelete.deleted_counts.original <= 0) throw new Error(vendor_error);
        await Banner.deleteOne({ _id: req.params.id }).session(session);
      }
      status = 204;
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      stack = err.message || err.stack || err;
      error = handleError(err);
    } finally {
      await session.endSession();
      sendResponse(res, status, data, error, stack);
    }
  } else {
    try {
      const id = req.params.id;
      const banner = await Banner.findById(id);
      if (banner) {
        const cloudinaryDelete = await cloudinary.api.delete_resources([banner.cloudinary]);
        if (cloudinaryDelete.deleted_counts.original <= 0) throw new Error(vendor_error);
        await Banner.deleteOne({ _id: req.params.id })
      }
      status = 204;
    } catch (err) {
      stack = err.message || err.stack || err;
      error = handleError(err);
    } finally {
      sendResponse(res, status, data, error, stack);
    }
  }
}

exports.getAllBanner = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', []);

    // 2) query data dan query count total
    const results = await Banner.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['-password', '-__v']);
    const totalDocument = await Banner.find(queryParams.objFilterSearch).countDocuments();
 
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

exports.getAllBannerUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const results = await Banner.find({ status: 1 }).sort('-created_at');
 
    // 3) bentuk response data dan set status code = 200
    data = {
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