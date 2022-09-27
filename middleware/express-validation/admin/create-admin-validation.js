const { body } = require('express-validator');
const { username_required, password_required, password_min_8, username_alphanumeric, confirmation_password_required, password_match, bad_request, role_required, role_not_valid, username_max_30, province_required } = require('../../../utils/error-message');

module.exports = [
  body('username')
    .notEmpty().withMessage(username_required)
    .isLength({ max: 30 }).withMessage(username_max_30)
    .isAlphanumeric().withMessage(username_alphanumeric)
    .trim(),
  body('password')
    .notEmpty().withMessage(password_required)
    .isLength({ min: 8 }).withMessage(password_min_8)
    .trim(),
  body('confirmation_password')
    .notEmpty().withMessage(confirmation_password_required)
    .custom((value, { req }) => {
      try {
        if (value != req.body.password) throw(password_match);
        return true;
      } catch (error) {
        throw(error.stack || bad_request);
      }
    })
    .trim(),
  body('role')
    .notEmpty().withMessage(role_required)
    .custom((value, { req }) => {
      try {
        if (value && ![1, 2].includes(value)) throw(role_not_valid); // 1 superadmin, 2 kasir
        return true;
      } catch (error) {
        throw(error.stack || bad_request);
      }
    }),
  body('province')
    .notEmpty().withMessage(province_required),
]