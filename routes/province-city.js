const express = require('express');
const router = express.Router();

const provinceCityController = require('../controllers/province-city');

const checkAuthAdmin = require('../middleware/check-auth-admin');

router.post('/create_province', checkAuthAdmin, provinceCityController.createProvince);
router.post('/province', checkAuthAdmin, provinceCityController.getAllProvince);
router.post('/province_user', provinceCityController.getAllProvinceUser);
router.post('/delete_province/:id', checkAuthAdmin, provinceCityController.deleteProvince);
router.post('/update_province/:id', checkAuthAdmin, provinceCityController.updateProvince);

router.post('/create_city', checkAuthAdmin, provinceCityController.createCity);
router.post('/city/:id', checkAuthAdmin, provinceCityController.getAllCityByProvince);
router.post('/city_user', provinceCityController.getAllCityUser);
router.post('/city_user/:id', provinceCityController.getAllCityByProvince);
router.post('/delete_city/:id', checkAuthAdmin, provinceCityController.deleteCity);
router.post('/update_city/:id', checkAuthAdmin, provinceCityController.updateCity);

module.exports = router;