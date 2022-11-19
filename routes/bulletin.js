const express = require('express');
const router = express.Router();

const bulletinController = require('../controllers/bulletin');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const createBulletinValidation = require('../middleware/express-validation/bulletin/create-bulletin-validation');
const { processImage } = require('../middleware/multer');

router.post('/create', checkAuthAdmin, processImage, createBulletinValidation, bulletinController.createBulletin);
router.post('/update/:id', checkAuthAdmin, processImage, bulletinController.updateBulletin);
router.post('/delete/:id', checkAuthAdmin, bulletinController.deleteBulletin);
router.post('/', checkAuthAdmin, bulletinController.getAllBulletin);

module.exports = router;