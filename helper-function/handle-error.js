const { bad_request, unknown_error, auth, database_error } = require("../utils/error-message");

module.exports = (error) => {
  let fixError = '';

  if (error.name === 'Error') {
    fixError = error.message;
    return fixError;
  }

  if (error.name === 'MongoServerError') {
    fixError = database_error;
    return fixError;
  }

  if (error.name === 'SyntaxError') {
    fixError = unknown_error;
    return fixError;
  }

  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    if (error.code === 11000) { // error unique
      fixError.msg = Object.keys(error.keyPattern)[0] + ' ' + 'unique'
      return fixError;
    }
  }

  if (error.name === 'JsonWebTokenError') {
    fixError = auth;
    return fixError;
  }

  if (error.name === 'CastError') {
    fixError = bad_request;
    return fixError;
  }

  return fixError ? fixError : error;
}