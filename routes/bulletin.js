const express = require('express');
const router = express.Router();

const bulletinController = require('../controllers/bulletin');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const checkAuthUser = require('../middleware/check-auth-user');
const createBulletinValidation = require('../middleware/express-validation/bulletin/create-bulletin-validation');
const updateBulletinValidation = require('../middleware/express-validation/bulletin/update-bulletin-validation');
const { processImage } = require('../middleware/multer');

router.post('/create', checkAuthAdmin, processImage, createBulletinValidation, bulletinController.createBulletin);
router.post('/update/:id', checkAuthAdmin, processImage, updateBulletinValidation, bulletinController.updateBulletin);
router.post('/delete/:id', checkAuthAdmin, bulletinController.deleteBulletin);
router.post('/', checkAuthAdmin, bulletinController.getAllBulletin);
router.post('/bulletin_user', checkAuthUser, bulletinController.getAllBulletinUser);
router.post('/:id', checkAuthUser, bulletinController.getBulletin);

module.exports = router;