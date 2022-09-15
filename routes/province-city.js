const express = require('express');
const router = express.Router();

const provinceCityController = require('../controllers/province-city');

const checkAuthAdmin = require('../middleware/check-auth-admin');

router.post('/create_province', checkAuthAdmin, provinceCityController.createProvince);
router.post('/province', checkAuthAdmin, provinceCityController.getAllProvince);
router.post('/delete_province/:id', checkAuthAdmin, provinceCityController.deleteProvince);
// router.post('/update/:id', checkAuthAdmin, provinceCityController.updateProvinceCity);
// router.post('/', checkAuthAdmin, provinceCityController.getAllProvinceCity);
router.post('/create_city', checkAuthAdmin, provinceCityController.createCity);
router.post('/city/:id', checkAuthAdmin, provinceCityController.getAllCityByProvince);
router.post('/delete_city/:id', checkAuthAdmin, provinceCityController.deleteCity);

module.exports = router;