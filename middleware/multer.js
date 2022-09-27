const multer = require('multer');
const path = require('path');
const handleError = require('../helper-function/handle-error');
const sendResponse = require('../helper-function/send-response');
const { image_not_valid } = require('../utils/error-message');
const maxSize = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/images/');
  },
  filename: (req, file, callback) => {
    callback(null, req.user._id + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: {
  fileSize: maxSize
} }).single('image');

exports.processImage = (req, res, next) => {
  upload(req, res, (err) => {
    try {
      if (err) throw new Error(err.message);
      if (!['image/png', 'image/jpg', 'image/jpeg'].includes(req.file.mimetype)) throw new Error(image_not_valid);
      next();
    } catch (error) {
      const errorData = handleError(error);
      sendResponse(res, 500, [], errorData);
    }
  });
}