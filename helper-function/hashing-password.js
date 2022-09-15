const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(15);

module.exports = (password) => {
  let hash = bcrypt.hashSync(password, salt);
  return hash;
}