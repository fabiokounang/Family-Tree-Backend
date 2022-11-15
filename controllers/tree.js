const { validationResult } = require("express-validator");
const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");
const Tree = require("../model/tree");
const User = require("../model/user");
const { user_not_found } = require("../utils/error-message");

exports.createTree = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(bad_request);

    let treeExist = false;
    const tree = await Tree.find();
    if (tree.length > 0) treeExist = true;

    const user = await User.findOne({ username: req.body.user });
    if (!user) throw new Error(user_not_found);

    const newTree = new Tree({ user: req.body.user });

    await newTree.save();

    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getTree = async (req, res, next) => {
  const trees = await Tree.find().populate({
    path: 'user',
    select: '-password'
  });

  res.send({
    data: trees
  })
}