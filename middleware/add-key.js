module.exports = (type) => {
  return (req, res, next) => {
    req.fileType = type;
    next();
  }
}