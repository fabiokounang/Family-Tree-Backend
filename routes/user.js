const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const checkAuthUser = require('../middleware/check-auth-user');
// const forgetPasswordUserValidation = require('../middleware/express-validation/user/forget-password-user-validation');
const signinUserValidation = require('../middleware/express-validation/user/signin-user-validation');
const signupUserValidation = require('../middleware/express-validation/user/signup-user-validation');
const updateUserValidation = require('../middleware/express-validation/user/update-user-validation');
const { processImage } = require('../middleware/multer');

router.post('/signup', signupUserValidation, userController.signupUser);
router.post('/signin', signinUserValidation, userController.signinUser);
router.post('/uploadimage', checkAuthUser, processImage, userController.uploadImage);
router.post('/changepassword', checkAuthUser, userController.changePassword);
// router.post('/forgetpassword', forgetPasswordUserValidation, userController.forgetPasswordUser);
router.post('/signout', checkAuthUser, userController.signoutUser);
router.post('/self', checkAuthUser, userController.getOneUser);
router.post('/update/:id', checkAuthUser, updateUserValidation, userController.updateUser);
router.post('/admin/:id', checkAuthAdmin, userController.getOneUser);
router.post('/', checkAuthAdmin, userController.getAllUser);

module.exports = router;