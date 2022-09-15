const { body } = require('express-validator');
const { title_required, description_required, title_max_200, description_max_200, user_broadcast_required, user_broadcast_min_1 } = require('../../../utils/error-message');

module.exports = [
  body('title')
    .notEmpty().withMessage(title_required)
    .isLength({ max: 200 }).withMessage(title_max_200)
    .trim(),
  body('description')
    .notEmpty().withMessage(description_required)
    .isLength({ max: 200 }).withMessage(description_max_200)
    .trim(),
  body('users')
    .notEmpty().withMessage(user_broadcast_required)
    .isArray({ min: 1 }).withMessage(user_broadcast_min_1)
]