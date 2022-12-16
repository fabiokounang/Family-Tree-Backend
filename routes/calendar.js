const express = require('express');
const router = express.Router();

const calendarController = require('../controllers/calendar');

const checkAuthAdmin = require('../middleware/check-auth-admin');
const checkAuthUser = require('../middleware/check-auth-user');
const updateCalendarValidation = require('../middleware/express-validation/calendar/update-calendar-validation');
const updateDataCalendarValidation = require('../middleware/express-validation/calendar/update-data-calendar-validation');
const multerExcel = require('../middleware/multer-excel');

router.post('/create', checkAuthAdmin, multerExcel, calendarController.createCalendar);
router.post('/update/:id', checkAuthAdmin, updateCalendarValidation, calendarController.updateEventCalendar);
router.post('/update_data/:id', checkAuthAdmin, updateDataCalendarValidation, calendarController.updateDataCalendar);
router.post('/update_status/:id', checkAuthAdmin, calendarController.updateStatusCalendar);
router.post('/delete/:id', checkAuthAdmin, calendarController.deleteCalendar);
router.post('/admin/active/:id', checkAuthAdmin, calendarController.getOneCalendarAdmin);
router.post('/user/active', checkAuthUser, calendarController.getOneCalendarUser);
router.post('/', checkAuthAdmin, calendarController.getAllCalendar);

// [
//   { id: 1, name: 'birthday' },
//   { id: 2, name: 'graduation party' },
//   { id: 7, name: "chinese new year" },
//   { id: 7, name: "housewarming" },
//   { id: 7, name: "congratulations" },
//   { id: 3, name: 'reunion' },
//   { id: 3, name: 'wedding' },
//   { id: 4, name: 'wedding' },
//   { id: 4, name: 'retirement' },
//   { id: 5, name: 'anniversary' },
//   { id: 5, name: 'baby shower' },
//   { id: 6, name: 'new baby' },
//   { id: 7, name: 'thank you party' },
//   { id: 7, name: 'thank you party' },
//   { id: 7, name: 'christmas' },
//   { id: 7, name: 'good bye' },
//   { id: 7, name: 'good luck' },
//   { id: 7, name: 'new year' },
//   { id: 7, name: 'symphaty' },
//   { id: 7, name: 'thanksgiving' },
//   { id: 7, name: 'thanksgiving' },
//   { id: 7, name: 'first communion' },
//   { id: 7, name: 'baptism' },
//   { id: 7, name: "mother's day" },
//   { id: 7, name: "father's day" },
//   { id: 7, name: "bridal shower" },
//   { id: 7, name: "valentine" },
//   { id: 7, name: "independence day" },
// ]

module.exports = router;