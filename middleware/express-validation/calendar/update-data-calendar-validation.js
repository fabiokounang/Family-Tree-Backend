const { body } = require('express-validator');
const { calendar_name_required, year_required, year_numeric } = require('../../../utils/error-message');

module.exports = [
  body('name')
    .notEmpty().withMessage(calendar_name_required)
    .trim(),
  body('year')
    .notEmpty().withMessage(year_required)
    .isNumeric().withMessage(year_numeric)
]