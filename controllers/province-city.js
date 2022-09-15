const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');

const Admin = require("../model/admin")

const handleError = require("../helper-function/handle-error");
const processErrorForm = require("../helper-function/process-error-form");
const processQueryParameter = require('../helper-function/process-query-parameter');
const returnData = require('../helper-function/return-data');
const sendResponse = require('../helper-function/send-response');
const sendCookie = require('../helper-function/send-cookie');
const { bad_request, province_unique } = require('../utils/error-message');
const Province = require('../model/province');
const City = require('../model/city');


exports.createProvince = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) validasi request body
    const errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 2) query find admin exist / tidak
    const province = await Province.findOne({ province: req.body.province });
    if (province) throw new Error(province_unique);

    // 3) create new province
    const lastProvince = await Province.find().sort({ created_at: -1 }).limit(1);
    let inc = null
    if (lastProvince.length <= 0) inc = '01';
    else inc = +lastProvince[0].code + 1;

    inc = String(inc).length == 1 ? '0' + String(inc) : inc;

    const newProvince = new Province({
      code: inc,
      province: req.body.province
    });
    const result = await newProvince.save();

    // 4) bentuk response data dan set status code = 200
    data = {
      _id: result._id,
      code: inc
    }
    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.createCity = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) validasi request body
    const errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 2) query find admin exist / tidak
    const province = await City.findOne({ provinceId: req.body.province,city: req.body.city });
    if (province) throw new Error(city_unique);

    // 3) create new province
    const lastCity = await City.find().sort({ created_at: -1 }).limit(1);
    let inc = null
    if (lastCity.length <= 0) inc = 0;
    else inc = +lastCity[0].code + 1;

    const newCity = new City({
      code: inc,
      provinceId: req.body.provinceId,
      city: req.body.city
    });
    const result = await newCity.save();

    // 4) bentuk response data dan set status code = 200
    data = {
      _id: result._id,
      code: inc
    }
    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllProvince = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', ['username', 'fullname']);

    // 2) query data dan query count total
    const results = await Province.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['-__v']);
    const totalDocument = await Province.find(queryParams.objFilterSearch).countDocuments();

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

exports.getAllCityByProvince = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) validasi parameter
    const id =  req.params.id;
    if (!id) throw new Error(bad_request);
    
    // 2) query city
    const results = await City.find({ provinceId: req.params.id });

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

exports.deleteProvince = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) query delete by id
    await Province.deleteOne({ _id: id });
    await City.deleteMany({ provinceId: id });

    status = 204;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteCity = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) query delete by id
    await City.deleteOne({ _id: id });

    status = 204;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}