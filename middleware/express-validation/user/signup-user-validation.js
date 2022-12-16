const { body } = require("express-validator");
const { gender_required, password_match, password_required, password_8_16, confirmation_password_required, bad_request, email_required, email_not_valid, place_of_birth_required, city_required, fullname_required, nik_length_fix_16 } = require("../../../utils/error-message");

module.exports = [
  body('fullname')
    .notEmpty().withMessage(fullname_required)
    .trim(),
  body('nik')
    .optional({ checkFalsy: true })
    .isLength({ min: 16, max: 16 }).withMessage(nik_length_fix_16)
    .trim(),
  body('email')
    .notEmpty().withMessage(email_required)
    .isEmail().withMessage(email_not_valid)
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
    }),
  body('gender')
    .notEmpty().withMessage(gender_required)
    .trim(),
  // body('status')
  //   .optional({ checkFalsy: true })
  //   .custom((value, {req}) => {
  //     try {
  //       if (![1, 2].includes(value)) throw(status_not_valid);
  //       return true;
  //     } catch (error) {
  //       throw(error.stack || bad_request);
  //     }
  //   }),
  // body('first_name_latin')
  //   .notEmpty().withMessage(first_name_latin_required)
  //   .isLength({ max: 200 }).withMessage(first_name_latin_max_200)
  //   .trim(),
  // body('last_name_latin')
  //   .notEmpty().withMessage(last_name_latin_required)
  //   .isLength({ max: 200 }).withMessage(last_name_latin_max_200),
  // body('chinese_name')
  //   .optional({ checkFalsy: true })
  //   .isLength({ max: 200 }).withMessage(chinese_name_max_200),
  // body('life_status'),
  // body('address')
  //   .notEmpty().withMessage(address_required)
  //   .isLength({ max: 200 }).withMessage(address_max_300),
  // body('date_of_birth')
  //   .notEmpty().withMessage(date_of_birth_required),
  body('place_of_birth')
    .notEmpty().withMessage(place_of_birth_required),
  // body('phone')
  //   .notEmpty().withMessage(phone_required)
  //   .isNumeric().withMessage(phone_not_valid)
  //   .isLength({ min: 10, max: 14 }).withMessage(phone_min_max_10_14),
  // body('wechat')
  //   .optional({ checkFalsy: true })
  //   .isNumeric().withMessage(phone_not_valid)
  //   .isLength({ min: 10, max: 14 }).withMessage(phone_min_max_10_14),
  body('city_of_residence')
    .notEmpty().withMessage(city_required),
  // body('postal_address')
  //   .notEmpty().withMessage(postal_address_required)
  //   .isLength({ max: 6 }).withMessage(postal_address_max_6),
  // body('remark')
];