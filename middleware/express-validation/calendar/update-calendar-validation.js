const { body } = require('express-validator');
const { bad_request, month_required, month_numeric, day_required, day_numeric, events_required, event_name_required } = require('../../../utils/error-message');

module.exports = [
  body('month')
    .notEmpty().withMessage(month_required)
    .isNumeric().withMessage(month_numeric),
  body('day')
    .notEmpty().withMessage(day_required)
    .isNumeric().withMessage(day_numeric)
]