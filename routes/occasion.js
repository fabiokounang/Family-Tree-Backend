const express = require('express');
const router = express.Router();

const occasionController = require('../controllers/occasion');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const checkAuthUser = require('../middleware/check-auth-user');
const createOccasionValidation = require('../middleware/express-validation/occasion/create-occasion-validation');
const registerUserOccasionValidation = require('../middleware/express-validation/occasion/register-user-occasion-validation');

router.post('/create', checkAuthAdmin, createOccasionValidation, occasionController.createOccasion);
router.post('/present/:id', checkAuthUser, occasionController.registerUserOccasion);
router.post('/update/:id', checkAuthAdmin, occasionController.updateOccasion);
router.post('/delete/:id', checkAuthAdmin, occasionController.deleteOccasion);
router.post('/', checkAuthAdmin, occasionController.getAllOccasion);

module.exports = router;