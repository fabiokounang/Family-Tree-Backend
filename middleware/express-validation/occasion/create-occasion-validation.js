const { body } = require('express-validator');
const { title_required, title_max_200, expired_date_required } = require("../../../utils/error-message");

module.exports = [
  body('title')
    .notEmpty().withMessage(title_required)
    .isLength({ max: 200 }).withMessage(title_max_200)
    .trim(),
  body('expired_date')
    .notEmpty().withMessage(expired_date_required)
    .trim()
]