module.exports = (type) => {
  return (req, res, next) => {
    req.fileType = type;
    console.log(type)
    next();
  }
}