const express = require('express');
const router = express.Router();

const memberCardController = require('../controllers/membercard');

const addKey = require('../middleware/add-key');
const checkAuthAdmin = require('../middleware/check-auth-admin');
const { processImage } = require('../middleware/multer');

router.post('/create', checkAuthAdmin, addKey('membercard'), processImage, memberCardController.createMemberCard);

module.exports = router;