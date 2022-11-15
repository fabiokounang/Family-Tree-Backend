const { body } = require('express-validator');
const { title_required, title_max_200, expired_date_required, point_required, province_required, bad_request, occasion_type_required, scope_required } = require("../../../utils/error-message");

module.exports = [
  body('title')
    .notEmpty().withMessage(title_required)
    .isLength({ max: 200 }).withMessage(title_max_200)
    .trim(),
  // body('type')
  //   .notEmpty().withMessage(occasion_type_required),
  body('point')
    .notEmpty().withMessage(point_required),
  body('scope')
    .notEmpty().withMessage(scope_required),
  body('province')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      try {
        if (req.body.scope <= 2 && !value) throw(province_required);
        return true;
      } catch (error) {
        throw(error.stack || bad_request); 
      }
    }),
  body('expired_date')
    .notEmpty().withMessage(expired_date_required)
    .trim()
]