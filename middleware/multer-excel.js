const multer = require('multer');
const path = require('path');
const os = require('os');
console.log(os.platform());
console.log(path.join(__dirname, 'public'));
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, 'public'));
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname));
  }
});


const excelFilter = (req, file, cb) => {
  if (file.mimetype.includes("excel") || file.mimetype.includes("spreadsheetml")) {
    cb(null, true);
  } else {
    cb("Please upload only excel file.", false);
  }
};

const upload = multer({ storage: storage, fileFilter: excelFilter }).any('file');

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      res.send({
        status: false,
        data: [],
        error: err.message
      });
    } else {
      req.fileUpload = req.files[0];
      next();
    }
  });
}
