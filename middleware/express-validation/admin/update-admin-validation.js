const { body } = require("express-validator");
const { username_required, username_max_50, username_alphanumeric, role_required, role_not_valid, bad_request } = require("../../../utils/error-message");

module.exports = [
  body('username')
    .notEmpty().withMessage(username_required)
    .isLength({ max: 50 }).withMessage(username_max_50)
    .isAlphanumeric().withMessage(username_alphanumeric)
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
    })
]