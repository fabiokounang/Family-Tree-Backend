const express = require('express');
const router = express.Router();

const occasionController = require('../controllers/occasion');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const createOccasionValidation = require('../middleware/express-validation/occasion/create-occasion-validation');

router.post('/create', checkAuthAdmin, createOccasionValidation, occasionController.createOccasion);
router.post('/update/:id', checkAuthAdmin, occasionController.updateOccasion);
router.post('/delete/:id', checkAuthAdmin, occasionController.deleteOccasion);
router.post('/', checkAuthAdmin, occasionController.getAllOccasion);

module.exports = router;