const { body } = require('express-validator');
const { email_required, email_not_valid } = require("../../../utils/error-message");

module.exports = [
  body('email')
    .notEmpty().withMessage(email_required)
    .isEmail().withMessage(email_not_valid)
    .trim(),
]