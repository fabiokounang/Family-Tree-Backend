const { validationResult } = require('express-validator');

const Theme = require('../model/theme');
const User = require('../model/user');

const processErrorForm = require('../helper-function/process-error-form');
const returnData = require('../helper-function/return-data');
const handleError = require('../helper-function/handle-error');
const sendResponse = require('../helper-function/send-response');
const processQueryParameter = require('../helper-function/process-query-parameter');

const { createLog } = require('./log');

const { theme_unique, theme_not_found } = require('../utils/error-message');

exports.createTheme = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) validasi request body
    const errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 2) query find theme theme exist / tidak
    const theme = await Theme.findOne({ theme: req.body.theme, color: req.body.color });
    if (theme) throw new Error(theme_unique);

    // 3) create new marga theme
    const newTheme = new Theme({
      theme: req.body.theme,
      color: req.body.color,
      text: req.body.text
    });

    const result = await newTheme.save();

    // 4) bentuk response data dan set status code = 200
    data = {
      _id: result._id,
      theme: result.theme,
      color: result.color
    }
    status = 201;
    createLog(req.user._id, 'create theme');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }  
}

exports.updateTheme = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) validasi request body
    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 3) query find admin by id
    let theme = await Theme.findById(id).select(['theme', 'color']);
    if (!theme) throw(theme_not_found);

    //4) query update data marga
    theme.theme = req.body.theme || theme.theme;
    await theme.save({validateBeforeSave: true});

    data = theme.toObject();
    status = 200;

    createLog(req.user._id, 'update theme name');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateColor = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) validasi request body
    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 3) query find admin by id
    let theme = await Theme.findById(id).select(['theme', 'color']);
    if (!theme) throw(theme_not_found);

    //4) query update data marga
    theme.color = req.body.color || theme.color;
    await theme.save({validateBeforeSave: true});

    data = theme.toObject();
    status = 200;

    createLog(req.user._id, 'update theme color');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateText = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) validasi request body
    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 3) query find admin by id
    let theme = await Theme.findById(id).select(['theme', 'text', 'color']);
    if (!theme) throw(theme_not_found);

    //4) query update data marga
    theme.text = req.body.text || theme.text;
    await theme.save({validateBeforeSave: true});

    data = theme.toObject();
    status = 200;

    createLog(req.user._id, 'update theme color');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateStatus = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) validasi request body
    let errors = validationResult(req);    
    if (!errors.isEmpty()) throw new Error(bad_request);

    // 3) query find admin by id
    let theme = await Theme.findById(id).select(['status']);
    if (!theme) throw(theme_not_found);

    //4) query update data marga
    theme.status = req.body.status || theme.status;
    await theme.save({validateBeforeSave: true});

    data = theme.toObject();
    status = 200;

    createLog(req.user._id, 'update theme color');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllTheme = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) proses query parameter pagination etc
    const queryParams = processQueryParameter(req, 'created_at', ['theme', 'color']);

    // 2) query data dan query count total
    const results = await Theme.find(queryParams.objFilterSearch).sort(queryParams.sort).skip(queryParams.page * queryParams.limit).limit(queryParams.limit).select(['theme', 'text', 'color', 'status', 'created_at']);
    const totalDocument = await Theme.find(queryParams.objFilterSearch).countDocuments();

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

exports.getOneTheme = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) set id theme
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) query data theme by id
    const theme = await Theme.findById(id).select(['_id', 'theme', 'color', 'status', 'created_at']);
    if (!theme) throw new Error(theme_not_found);

    // 3) bentuk response data dan set status code = 200
    data = theme.toObject();
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteTheme = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id admin
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 2) query delete admin by id
    await Theme.deleteOne({_id: id});

    status = 204;
    createLog(req.user._id, 'delete theme');

  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
} 

exports.setUserTheme = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id user
    const id = req.user._id;

    // 2) query delete admin by id
    await User.updateOne({_id: id}, {
      $set: {
        theme: req.body.theme
      }
    });

    status = 204;

  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
} 