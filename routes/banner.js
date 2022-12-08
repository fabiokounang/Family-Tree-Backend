const express = require('express');
const router = express.Router();

const bannerController = require('../controllers/banner');

const addKey = require('../middleware/add-key');
const checkAuthAdmin = require('../middleware/check-auth-admin');
const checkAuthUser = require('../middleware/check-auth-user');
const createBannerValidation = require('../middleware/express-validation/banner/create-banner-validation');
const { processImage } = require('../middleware/multer');

router.post('/create', checkAuthAdmin, addKey('banner'), processImage, createBannerValidation, bannerController.createBanner);
router.post('/update/:id', checkAuthAdmin, processImage, bannerController.updateBanner);
router.post('/delete/:id', checkAuthAdmin, bannerController.deleteBanner);
router.post('/', checkAuthAdmin, bannerController.getAllBanner);
router.post('/banner_user', checkAuthUser, bannerController.getAllBannerUser);

module.exports = router;