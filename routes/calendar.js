const express = require('express');
const router = express.Router();

const calendarController = require('../controllers/calendar');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const checkAuthUser = require('../middleware/check-auth-user');
const createCalendarValidation = require('../middleware/express-validation/calendar/create-calendar-validation');
const updateCalendarValidation = require('../middleware/express-validation/calendar/update-calendar-validation');

router.post('/create', checkAuthAdmin, createCalendarValidation, calendarController.createCalendar);
router.post('/update/:id', checkAuthAdmin, updateCalendarValidation, calendarController.updateCalendar);
router.post('/update_status/:id', checkAuthAdmin, calendarController.updateStatusCalendar);
router.post('/delete/:id', checkAuthAdmin, calendarController.deleteCalendar);
router.post('/admin/active/:id', checkAuthAdmin, calendarController.getOneCalendar);
router.post('/user/active', checkAuthUser, calendarController.getOneCalendar);
router.post('/', checkAuthAdmin, calendarController.getAllCalendar);

module.exports = router;