const { body } = require("express-validator");
const { username_required, username_max_30, fullname_required, fullname_alphanumeric, address_max_300, date_of_birth_required, date_of_birth_not_valid, gender_required, gender_not_valid, address_required, password_match, password_required, password_8_16, confirmation_password_required, bad_request, first_name_latin_required, first_name_latin_alpha, last_name_latin_required, last_name_latin_alpha, last_name_latin_max_200, first_name_latin_max_200 } = require("../../../utils/error-message");

module.exports = [
  body('username')
    .notEmpty().withMessage(username_required)
    .isLength({ max: 30 }).withMessage(username_max_30)
    .trim(),
    body('password')
    .notEmpty().withMessage(password_required)
    .isLength({ min: 6, max: 16 }).withMessage(password_8_16)
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
];