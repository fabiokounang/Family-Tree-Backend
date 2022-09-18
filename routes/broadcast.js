const express = require('express');
const router = express.Router();

const broadcastController = require('../controllers/broadcast');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const createBroadcastValidation = require('../middleware/express-validation/broadcast/create-broadcast-validation');

router.post('/subscribe', broadcastController.saveSubscription);
router.post('/push', checkAuthAdmin, createBroadcastValidation, broadcastController.pushNotification);

module.exports = router;