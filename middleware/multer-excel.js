const multer = require('multer');
const path = require('path');
const os = require('os');
const pathDir = require('../utils/path-dir');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    let p = pathDir('');
    callback(null, p);
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname));
  }
});


const excelFilter = (req, file, cb) => {
  if (!file) {
    cb("File excel required", false);
  } else {
    if (file.mimetype.includes("excel") || file.mimetype.includes("spreadsheetml")) {
      cb(null, true);
    } else {
      cb("Please upload only excel file.", false);
    }
  }
};

const upload = multer({ storage: storage, fileFilter: excelFilter }).single('file');

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      res.send({
        status: false,
        data: [],
        error: err.message
      });
    } else {
      console.log(req.file)
      req.fileUpload = req.file;
      next();
    }
  });
}
