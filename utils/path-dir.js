const path = require('path');

module.exports = (pathname) => {
  return path.join(__dirname, pathname);
}