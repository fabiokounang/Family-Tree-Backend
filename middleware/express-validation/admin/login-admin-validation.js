const { body } = require('express-validator');
const { username_required, password_required, password_min_8, username_max_30 } = require("../../../utils/error-message");

module.exports = [
  body('username')
    .notEmpty().withMessage(username_required)
    .isLength({ max: 30 }).withMessage(username_max_30)
    .trim(),
  body('password')
    .notEmpty().withMessage(password_required)
    .isLength({ min: 8 }).withMessage(password_min_8)
    .trim()
]