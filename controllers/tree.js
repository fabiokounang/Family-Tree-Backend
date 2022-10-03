const { validationResult } = require("express-validator");
const Tree = require("../model/tree");

exports.createTree = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(bad_request);

    let treeExist = false;
    const tree = await Tree.find();
    if (tree.length > 0) treeExist = true;

    const newTree = new Tree({
      user
    });

    await newTree.save();

    status = 201;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}