const express = require('express');
const router = express.Router();

const themeController = require('../controllers/theme');
const checkAuthAdmin = require('../middleware/check-auth-admin');

router.post('/create', checkAuthAdmin, themeController.createTheme);
router.post('/update_theme/:id', checkAuthAdmin, themeController.updateTheme);
router.post('/update_color/:id', checkAuthAdmin, themeController.updateColor);
router.post('/update_status/:id', checkAuthAdmin, themeController.updateStatus);
router.post('/delete/:id', checkAuthAdmin, themeController.deleteTheme);
router.post('/:id', checkAuthAdmin, themeController.getOneTheme);
router.post('/', checkAuthAdmin, themeController.getAllTheme);

module.exports = router;