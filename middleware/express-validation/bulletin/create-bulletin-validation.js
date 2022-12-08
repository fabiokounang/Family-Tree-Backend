const { body } = require('express-validator');
const { title_required, description_required, subtitle_required, title_max_255, subtitle_max_500, description_max_1500, province_required } = require('../../../utils/error-message');

module.exports = [
  body('title')
    .notEmpty().withMessage(title_required)
    .isLength({ max: 255 }).withMessage(title_max_255)
    .trim(),
  body('subtitle')
    .notEmpty().withMessage(subtitle_required)
    .isLength({ max: 500 }).withMessage(subtitle_max_500)
    .trim(),
  body('description')
    .notEmpty().withMessage(description_required)
    .isLength({ max: 3000 }).withMessage(description_max_1500)
    .trim(),
  body('province')
    .notEmpty().withMessage(province_required)
]