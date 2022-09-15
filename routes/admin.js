const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const createAdminValidation = require('../middleware/express-validation/admin/create-admin-validation');
const loginAdminValidation = require('../middleware/express-validation/admin/login-admin-validation');
const updateAdminValidation = require('../middleware/express-validation/admin/update-admin-validation');
const updatePasswordAdminValidation = require('../middleware/express-validation/admin/update-password-admin-validation');
const updateStatusAdminValidation = require('../middleware/express-validation/admin/update-status-admin-validation');

router.post('/create', createAdminValidation, checkAuthAdmin, adminController.createAdmin);
router.post('/signin', loginAdminValidation, adminController.signinAdmin);
router.post('/signout', loginAdminValidation, adminController.signoutAdmin);
router.post('/update/:id', checkAuthAdmin, updateAdminValidation, adminController.updateAdmin);
router.post('/update_password/:id', checkAuthAdmin, updatePasswordAdminValidation, adminController.updatePassword);
router.post('/update_status/:id', checkAuthAdmin, updateStatusAdminValidation, adminController.updateStatus);
router.post('/delete/:id', checkAuthAdmin, adminController.deleteAdmin);
router.post('/:id', checkAuthAdmin, adminController.getOneAdmin);
router.post('/', checkAuthAdmin, adminController.getAllAdmin);

module.exports = router;