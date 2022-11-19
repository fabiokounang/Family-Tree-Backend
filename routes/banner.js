const express = require('express');
const router = express.Router();

const bannerController = require('../controllers/banner');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const createBannerValidation = require('../middleware/express-validation/banner/create-banner-validation');
const { processImage } = require('../middleware/multer');

router.post('/create', checkAuthAdmin, processImage, createBannerValidation, bannerController.createBanner);
router.post('/update/:id', checkAuthAdmin, processImage, bannerController.updateBanner);
router.post('/delete/:id', checkAuthAdmin, bannerController.deleteBanner);
router.post('/', checkAuthAdmin, bannerController.getAllBanner);

module.exports = router;