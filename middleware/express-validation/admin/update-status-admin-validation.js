const { body } = require('express-validator');
const { status_required, bad_request, status_not_valid } = require('../../../utils/error-message');

module.exports = [
  body('status')
    .notEmpty().withMessage(status_required)
    .custom((value, { req }) => {
      try {
        if (value && ![1, 2].includes(value)) throw(status_not_valid); // 1 active, 2 not active
        return true;
      } catch (error) {
        throw(error.stack || bad_request);
      }
    })
]