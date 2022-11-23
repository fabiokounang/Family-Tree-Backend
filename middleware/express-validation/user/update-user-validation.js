const { body } = require("express-validator");
const { fullname_required, fullname_alphanumeric, address_max_300, address_required, chinese_name_max_200, email_required, email_not_valid, place_of_birth_required, city_required } = require("../../../utils/error-message");

module.exports = [
  body('fullname')
    .notEmpty().withMessage(fullname_required)
    .trim(),
  body('email')
    .notEmpty().withMessage(email_required)
    .isEmail().withMessage(email_not_valid)
    .trim(),
  body('chinese_name')
    .optional({ checkFalsy: true })
    .isLength({ max: 200 }).withMessage(chinese_name_max_200),
  body('place_of_birth')
    .notEmpty().withMessage(place_of_birth_required),
  body('city_of_residence')
    .notEmpty().withMessage(city_required),
];