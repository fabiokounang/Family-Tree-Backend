const multer = require('multer');
const path = require('path');
const handleError = require('../helper-function/handle-error');
const sendResponse = require('../helper-function/send-response');
const { image_not_valid, image_required } = require('../utils/error-message');
const maxSize = 2 * 1024 * 1024;
const Datauri = require('datauri/parser');
const dUri = new Datauri();
const cloudinary = require('cloudinary').v2;
cloudinary.config({ secure: true });

const storage = multer.memoryStorage();

const upload = multer({ storage: storage, limits: {
  fileSize: maxSize
} }).single('image');

exports.processImage = async (req, res, next) => {
  upload(req, res, async (err) => {
    try {
      if (err) throw new Error(err.message);
      if (!req.file) throw new Error(image_required);
      if (!['image/png', 'image/jpg', 'image/jpeg'].includes(req.file.mimetype)) throw new Error(image_not_valid);
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        folder: 'images'
      };

      // Upload the image
      const dataUri = dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
      const file = dataUri.content;
      const result = await cloudinary.uploader.upload(file, options);
      req.public_id = result.public_id;
      req.resultFile = result.secure_url;
      next();
    } catch (error) {
      const errorData = handleError(error);
      sendResponse(res, 500, [], errorData);
    }
  });
}