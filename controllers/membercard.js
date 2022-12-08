const MemberCard = require("../model/membercard");

const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");
const { membercard_not_found } = require("../utils/error-message");

exports.createMemberCard = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const results = await MemberCard.create({
      image: req.resultFile,
      cloudinary: req.public_id,
      status: req.body.status || 1,
      province: req.body.province
    });
 
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

exports.updateMemberCard = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const membercard = await MemberCard.findById(req.params.id);
    if (!membercard) throw new Error(membercard_not_found);

    const province = await Province.findById(req.body.province);
    if (!province) throw new Error(province_not_found);

    membercard.image = req.resultFile || membercard.image;
    membercard.cloudinary = req.public_id || membercard.cloudinary;
    membercard.status = req.body.status || membercard.status;
    membercard.province = req.body.province || membercard.province;

    await banner.save();

    createLog(req.user._id, 'update member card');

    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteMemberCard = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  if (process.env.NODE_ENV === 'production') {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const id = req.params.id;
      const membercard = await MemberCard.findById(id);
      if (membercard) {
        const cloudinaryDelete = await cloudinary.api.delete_resources([membercard.cloudinary]);
        if (cloudinaryDelete.deleted_counts.original <= 0) throw new Error(vendor_error);
        await MemberCard.deleteOne({ _id: req.params.id }).session(session);
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
      const membercard = await MemberCard.findById(id);
      if (membercard) {
        const cloudinaryDelete = await cloudinary.api.delete_resources([membercard.cloudinary]);
        if (cloudinaryDelete.deleted_counts.original <= 0) throw new Error(vendor_error);
        await MemberCard.deleteOne({ _id: req.params.id })
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

exports.getAllMemberCard = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', []);

    // 2) query data dan query count total
    const results = await MemberCard.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['-password', '-__v']);
    const totalDocument = await MemberCard.find(queryParams.objFilterSearch).countDocuments();
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

exports.getBannerUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  
  try {
    const result = await Banner.findOne({ status: 1, province: req.user.place_of_birth });
    data = result;
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}