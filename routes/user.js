const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const checkAuthUser = require('../middleware/check-auth-user');

const { processImage } = require('../middleware/multer');
const signinUserValidation = require('../middleware/express-validation/user/signin-user-validation');
const signupUserValidation = require('../middleware/express-validation/user/signup-user-validation');
const updateUserValidation = require('../middleware/express-validation/user/update-user-validation');
const multerExcel = require('../middleware/multer-excel');

// ADMIN
router.post('/bulkcreate', checkAuthAdmin, multerExcel, userController.createBulkUser);
router.post('/update_password/:id', checkAuthAdmin, userController.updatePasswordUser);
router.post('/', checkAuthAdmin, userController.getAllUser);
router.post('/admin/:id', checkAuthAdmin, userController.getOneUser);
router.post('/delete/:id', checkAuthAdmin, userController.deleteUser);

// USER
router.post('/signup', signupUserValidation, userController.signupUser);
router.post('/signin', signinUserValidation, userController.signinUser);
router.post('/uploadimage', checkAuthUser, processImage, userController.uploadImage);
router.post('/changepassword/:id', checkAuthUser, userController.changePassword);
router.post('/fcm', checkAuthUser, userController.updateTokenFcm);
router.post('/self', checkAuthUser, userController.getOneUser);
router.post('/update/:id', checkAuthUser, updateUserValidation, userController.updateUser);
router.post('/user', checkAuthUser, userController.getUserForTrees);
router.post('/signout', checkAuthUser, userController.signoutUser);

module.exports = router;