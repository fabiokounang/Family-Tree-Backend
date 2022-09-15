module.exports = (res, status = true, data = [], error = {}, stack = {}) => {
  let objData = {
    ...data,
    error: error,
    stack: stack
  }

  if (process.env.NODE_ENV === 'production') delete objData.stack;
  if ([200, 201, 204].includes(status)) {
    delete objData.error;
    delete objData.stack;
  }

  res.status(status).send(objData);
}