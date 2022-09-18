const express = require('express');
const router = express.Router();

const logController = require('../controllers/theme');
const checkAuthAdmin = require('../middleware/check-auth-admin');

router.post('/', checkAuthAdmin, logController.getAllLog);

module.exports = router;