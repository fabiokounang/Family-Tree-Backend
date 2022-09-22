const express = require('express');
const router = express.Router();

const themeController = require('../controllers/theme');
const checkAuthAdmin = require('../middleware/check-auth-admin');
const checkAuthUser = require('../middleware/check-auth-user');

router.post('/create', checkAuthAdmin, themeController.createTheme);
router.post('/update_theme/:id', checkAuthAdmin, themeController.updateTheme);
router.post('/update_color/:id', checkAuthAdmin, themeController.updateColor);
router.post('/update_text/:id', checkAuthAdmin, themeController.updateText);
router.post('/update_status/:id', checkAuthAdmin, themeController.updateStatus);
router.post('/delete/:id', checkAuthAdmin, themeController.deleteTheme);
router.post('/usertheme', checkAuthUser, themeController.setUserTheme);
router.post('/admin', checkAuthAdmin, themeController.getAllTheme);
router.post('/user', checkAuthUser, themeController.getAllTheme);
router.post('/:id', checkAuthAdmin, themeController.getOneTheme);

module.exports = router;