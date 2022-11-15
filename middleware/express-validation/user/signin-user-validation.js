const { body } = require('express-validator');
const { email_required, password_required, password_8_16, password_alphanumeric, email_not_valid } = require("../../../utils/error-message");

module.exports = [
  body('email')
    .notEmpty().withMessage(email_required)
    .isEmail().withMessage(email_not_valid)
    .trim(),
  body('password')
    .notEmpty().withMessage(password_required)
    .isLength({ min: 6, max: 16 }).withMessage(password_8_16)
    .isAlphanumeric().withMessage(password_alphanumeric)
    .trim(),
]