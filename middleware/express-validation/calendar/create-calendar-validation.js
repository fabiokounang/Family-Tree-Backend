const { body } = require('express-validator');
const { calendar_name_required } = require('../../../utils/error-message');

module.exports = [
  body('name')
    .notEmpty().withMessage(calendar_name_required)
    .trim()
]