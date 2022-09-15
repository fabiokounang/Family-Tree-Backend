module.exports = (errors) => {
  let fixError = {};
  errors.reverse().forEach((error) => {
    fixError[error.param] = error.msg;
  });
  return fixError;
}