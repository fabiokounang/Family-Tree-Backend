const readXlsxFile = require('read-excel-file/node');
const fs = require('fs').promises;

const Calendar = require("../model/calendar");
const Province = require('../model/province');

const getDaysInMonth = require("../helper-function/get-days-in-month");
const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");

const { calendar_not_found, lunar_required, calendar_name_required, year_required, year_numeric, province_required, province_not_found, calendar_for_province_exist, bad_request } = require("../utils/error-message");
const pathDir = require('../utils/path-dir');

const { createLog } = require("./log");

exports.createCalendar = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  const pathFile = pathDir(req.fileUpload.filename);

  try {
    // 1) create calendar
    const rows = await readXlsxFile(pathFile);
    const name = rows[0][1];
    const year = rows[1][1];
    if (!name) throw new Error(calendar_name_required);
    if (!year) throw new Error(year_required);
    if (!req.body.province) throw new Error(province_required);

    if (isNaN(year)) throw new Error(year_numeric);

    const province = await Province.findById(req.body.province);
    if (!province) throw new Error(province_not_found);

    const calendar = await Calendar.findOne({
      province: req.body.province,
      year: year
    });
    if (calendar) throw new Error(calendar_for_province_exist);

    rows.shift();
    rows.shift();
    
    let arrCalendar = {};
    rows.forEach((row) => {
      if (row[0] && row[0] != 'Date') {
        if (!arrCalendar[row[1]]) arrCalendar[row[1]] = {};
        if (!row[2]) throw new Error(lunar_required);
        arrCalendar[row[1]] = Object.assign({}, arrCalendar[row[1]], {
          [row[0]]: {
            lunar: row[2],
            events: [],
            color: '',
            moon: ''
          }
        });
      }
    });

    // 2) query create calendar exist / tidak
    const newCalendar = new Calendar({
      name: name,
      year: year,
      calendar: JSON.stringify(arrCalendar),
      province: req.body.province
    });
    await newCalendar.save();
    
    // 4) bentuk response data dan set status code = 201
    status = 201;

    createLog(req.user._id, 'create new calendar');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    fs.unlink(pathFile);
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateEventCalendar = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id calendar
    const id = req.params.id;

    // 2) cek calendar exist by id
    const calendar = await Calendar.findById(id).lean();
    if (!calendar) throw new Error(calendar_not_found);
    
    // 3) parsing data calendar
    calendar.calendar = JSON.parse(calendar.calendar);

    // 4) validasi name event
    req.body.events = req.body.events.filter(val => val.name);

    if (req.body.moon) { // delete
      // 1 purnama, 2 mati
      Object.keys(calendar.calendar[req.body.month]).forEach((day) => {
        if (calendar.calendar[req.body.month][day].moon == req.body.moon) calendar.calendar[req.body.month][day].moon = '';
      });
    }

    // 5) set event ke tanggal calendar
    calendar.calendar[req.body.month][req.body.day] = Object.assign({}, calendar.calendar[req.body.month][req.body.day], {
      events: req.body.events && req.body.events.length > 0 ? req.body.events : calendar.calendar[req.body.month][req.body.day].events,
      lunar: req.body.lunar || calendar.calendar[req.body.month][req.body.day].lunar,
      moon: req.body.moon || calendar.calendar[req.body.month][req.body.day].moon
    });

    // 6) update calendar by id
    await Calendar.updateOne({ _id : id }, {
      $set: {
        name: req.body.name,
        calendar: JSON.stringify(calendar.calendar)
      }
    });

    // 7) response status 204 & create log
    status = 204;
    createLog(req.user._id, 'update calendar');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateDataCalendar = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id calendar
    const id = req.params.id;

    // 2) cek calendar exist by id
    const calendar = await Calendar.findById(id);
    if (!calendar) throw new Error(calendar_not_found);

    calendar.name = req.body.name || calendar.name;
    calendar.year = req.body.year || calendar.year;
    calendar.province = req.body.province || calendar.province;


    // 6) update calendar by id
    await calendar.save();
    
    // 7) response status 204 & create log
    status = 204;
    createLog(req.user._id, 'update name / year calendar');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteCalendar = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) set id calendar
    const id = req.params.id;

    // 2) delete calendar by id
    await Calendar.deleteOne({_id: id});

    // 3) response status 204
    status = 204;

    // 4) create log
    createLog(req.user._id, 'delete calendar');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllCalendar = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) query data dan query count total
    const calendars = await Calendar.find().sort({created_at: -1}).populate({
      path: 'province'
    });
    const provincies = await Province.find({ status: 1 });

    // 2) bentuk response data dan set status code = 200
    const results = [];
    Object.keys(calendars).forEach((i) => {
      results.push({
        _id: calendars[i]._id,
        index: i,
        name: calendars[i].name,
        year: calendars[i].year,
        status: calendars[i].status,
        province: calendars[i].province,
        created_at: calendars[i].created_at
      });
    });
    data = {
      provincies: provincies.map((value) => {
        return {
          id: value._id,
          name: value.province
        }
      }),
      values: results
    };
    status = 200;
  } catch (err) {
    console.log(err)
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateStatusCalendar = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    const id = req.params.id;
    if (!req.body.province) throw new Error(bad_request);

    const calendar = await Calendar.findById(id);
    if (!calendar) throw new Error(calendar_not_found);
    
    calendar.status = req.body.status ? 1 : (2 || calendar.status);

    await Calendar.updateMany({
      province: req.body.province
    }, {
      $set: {
        status: 2 // not active
      }
    });

    await calendar.save();

    status = 204;
    createLog(req.user._id, 'update status calendar');

  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getOneCalendarAdmin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) query data calendar aktif
    const id = req.params.id;
    const result = await Calendar.findById(id).lean();
    result.calendar = JSON.parse(result.calendar);

    // 2) bentuk response data dan set status code = 200
    data = {
      value: result
    };
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getOneCalendarUser = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) query data calendar aktif
    const result = await Calendar.findOne({ status: 1, province: req.user.place_of_birth }).lean();
    if (!result) {
      status = 200;
      data = { value: {} }
      return;
    }
    result.calendar = JSON.parse(result.calendar);


    // 2) mark weekend, weekdays + event, weekend + event
    Object.keys(result.calendar).forEach((month) => {
      Object.keys(result.calendar[month]).forEach((day) => {
        const isWeekend = new Date(result.year, +month - 1, +day - 1).getDay() >= 5;
        if (isWeekend) result.calendar[month][day].color = 'red';
        if (!isWeekend && result.calendar[month][day].events.length > 0) result.calendar[month][day].color = 'orange';
        if (isWeekend && result.calendar[month][day].events.length > 0) result.calendar[month][day].color = 'blue';
      });
    });

    // 3) bentuk response data dan set status code = 200
    data = {
      value: result
    };
    status = 200;
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}