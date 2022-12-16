const express = require('express');
const router = express.Router();

const memberCardController = require('../controllers/membercard');

const addKey = require('../middleware/add-key');
const checkAuthAdmin = require('../middleware/check-auth-admin');
const { processImage } = require('../middleware/multer');

router.post('/create', checkAuthAdmin, addKey('membercard'), processImage, memberCardController.createMemberCard);
router.post('/update/:id', checkAuthAdmin, addKey('membercard'), processImage, memberCardController.deleteMemberCard);
router.post('/delete/:id', checkAuthAdmin, memberCardController.deleteMemberCard);
router.post('/', checkAuthAdmin, memberCardController.getAllMemberCard);

module.exports = router;