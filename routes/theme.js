const express = require('express');
const router = express.Router();

const themeController = require('../controllers/theme');
const checkAuthAdmin = require('../middleware/check-auth-admin');

router.post('/create', checkAuthAdmin, themeController.createTheme);
router.post('/update/:id', checkAuthAdmin, themeController.updateTheme);
router.post('/delete/:id', checkAuthAdmin, themeController.deleteTheme);
router.post('/:id', checkAuthAdmin, themeController.getOneTheme);
router.post('/', checkAuthAdmin, themeController.getAllTheme);

module.exports = router;