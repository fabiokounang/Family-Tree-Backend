const { body } = require("express-validator");
const { password_required, password_match, confirmation_password_required, bad_request } = require("../../../utils/error-message");

module.exports = [
  body('password')
    .notEmpty().withMessage(password_required)
    .isLength({ min: 8 }).withMessage(password_match)
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
]