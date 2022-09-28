const express = require('express');
const router = express.Router();

const pointController = require('../controllers/point');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const checkAuthUser = require('../middleware/check-auth-user');

router.post('/user', checkAuthUser, pointController.getUserPoint);
router.post('/user/:id', checkAuthAdmin, pointController.getUserPointByAdmin);
router.post('/user/history', checkAuthUser, pointController.getUserHistoryPoint);
router.post('/user/all/history', checkAuthAdmin, pointController.getAllUserHistoryPoint);

module.exports = router;