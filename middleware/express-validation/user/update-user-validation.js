const { body } = require("express-validator");
const { username_required, username_max_30, fullname_required, fullname_alphanumeric, address_max_300, date_of_birth_required, date_of_birth_not_valid, gender_required, gender_not_valid, address_required, password_match, password_required, password_min_8, confirmation_password_required, bad_request } = require("../../../utils/error-message");

module.exports = [
  body('username')
    .notEmpty().withMessage(username_required)
    .isLength({ max: 30 }).withMessage(username_max_30)
    .trim(),
  body('fullname')
    .notEmpty().withMessage(fullname_required)
    .isAlphanumeric().withMessage(fullname_alphanumeric)
    .trim(),
  body('address')
    .notEmpty().withMessage(address_required)
    .isLength({ max: 30 }).withMessage(address_max_300)
    .trim(),
  body('date_of_birth')
    .notEmpty().withMessage(date_of_birth_required)
    .isDate().withMessage(date_of_birth_not_valid)
    .trim(),
  body('gender')
    .notEmpty().withMessage(gender_required)
    .custom((value, { req }) => {
      try {
        if (!['male', 'female'].includes(value)) throw(gender_not_valid);
        return true;
      } catch (error) {
        throw(error.stack || bad_request);
      }
    })
];