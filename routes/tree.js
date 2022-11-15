const express = require('express');
const router = express.Router();

const treeController = require('../controllers/tree');
const checkAuthAdmin = require('../middleware/check-auth-admin');
const checkAuthUser = require('../middleware/check-auth-user');

router.post('/', checkAuthUser, treeController.getTree);
router.post('/create', checkAuthUser, treeController.createTree);

module.exports = router;