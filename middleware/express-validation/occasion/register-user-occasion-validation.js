const { body } = require('express-validator');
const { username_required, username_max_50, password_required, password_8_16, password_alphanumeric } = require("../../../utils/error-message");

module.exports = [
  body('username')
    .notEmpty().withMessage(username_required)
    .isLength({ max: 50 }).withMessage(username_max_50)
    .trim(),
  body('password')
    .notEmpty().withMessage(password_required)
    .isLength({ min: 6, max: 16 }).withMessage(password_8_16)
    .isAlphanumeric().withMessage(password_alphanumeric)
    .trim(),
]