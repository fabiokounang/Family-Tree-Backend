const cloudinary = require('cloudinary').v2;
const { validationResult } = require("express-validator");

const Bulletin = require("../model/bulletin");

const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const processQueryParameter = require('../helper-function/process-query-parameter');
const sendResponse = require("../helper-function/send-response");

const { bulletin_unique, bulletin_not_found, bad_request, province_not_found } = require("../utils/error-message");

const { createLog } = require("./log");
const Province = require('../model/province');

exports.createBulletin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(bad_request);

    const bulletin = await Bulletin.findOne({ title: req.body.title });
    if (bulletin) throw new Error(bulletin_unique);

    const province = await Province.findById(req.body.province);
    if (!province) throw new Error(province_not_found);

    const newBulletin = new Bulletin({
      title: req.body.title,
      subtitle: req.body.subtitle,
      image: req.resultFile,
      cloudinary: req.public_id,
      description: req.body.description,
      status: req.body.status || 1,
      province: req.body.province
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

    const province = await Province.findById(req.body.province);
    if (!province) throw new Error(province_not_found);

    bulletin.title = req.body.title || bulletin.title;
    bulletin.subtitle = req.body.subtitle || bulletin.subtitle;
    bulletin.image = req.resultFile || bulletin.image;
    bulletin.cloudinary = req.public_id || bulletin.cloudinary;
    bulletin.description = req.body.description || bulletin.description;
    bulletin.status = req.body.status || bulletin.status;
    bulletin.province = req.body.province || bulletin.province;

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
  if (process.env.NODE_ENV === 'production') {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const id = req.params.id;
      const bulletin = await Bulletin.findById(id);
      if (bulletin) {
        const cloudinaryDelete = await cloudinary.api.delete_resources([bulletin.cloudinary]);
        if (cloudinaryDelete.deleted_counts.original <= 0) throw new Error(vendor_error);
        await bulletin.deleteOne({ _id: req.params.id }).session(session);
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
      const bulletin = await Bulletin.findById(id);
      if (bulletin) {
        const cloudinaryDelete = await cloudinary.api.delete_resources([bulletin.cloudinary]);
        if (cloudinaryDelete.deleted_counts.original <= 0) throw new Error(vendor_error);
        await bulletin.deleteOne({ _id: req.params.id });
      }
      status = 204;
    } catch (err) {
      console.log(err)
      stack = err.message || err.stack || err;
      error = handleError(err);
    } finally {
      sendResponse(res, status, data, error, stack);
    }
  }

}

exports.getAllBulletin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', ['title', 'subtitle']);

    // 2) query data dan query count total
    const results = await Bulletin.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['-password', '-__v']).populate({
      path: 'province'
    });
    const totalDocument = await Bulletin.find(queryParams.objFilterSearch).countDocuments();
    const provincies = await Province.find();
 
    // 3) bentuk response data dan set status code = 200
    data = {
      page: queryParams.page,
      limit: queryParams.limit,
      max: Math.ceil(totalDocument / queryParams.limit),
      pageSize: [10, 25, 50, 100, 200],
      total: totalDocument,
      values: results,
      provincies: provincies.map((val) => {
        return {
          id: val._id,
          name: val.province
        }
      })
    };
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllBulletinUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const queryParams = processQueryParameter(req, 'created_at', ['title', 'subtitle']);

    // 2) query data dan query count total
    const results = await Bulletin.find({ status: 1, province: req.user.place_of_birth, ...queryParams.objFilterSearch }).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['-password', '-__v']);
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

exports.getBulletin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const bulletin = await Bulletin.findById(req.params.id).lean();
    if (bulletin.province.toString() != req.user.place_of_birth.toString()) throw new Error(bad_request);
    if (!bulletin) throw new Error(bad_request);

    data = bulletin;
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}