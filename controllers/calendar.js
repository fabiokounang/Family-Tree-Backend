const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const fs = require('fs').promises;

const Calendar = require("../model/calendar");

const getDaysInMonth = require("../helper-function/get-days-in-month");
const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");

const { calendar_not_found, event_name_required, bad_request, lunar_required } = require("../utils/error-message");

const { createLog } = require("./log");

exports.createCalendar = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  const pathFile = path.join(__dirname, '..', 'public', req.fileUpload.filename);

  try {
    // 1) create calendar
    const rows = await readXlsxFile(pathFile);
    const name = rows[0][1];
    const year = rows[1][1];
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
    const calendar = new Calendar({
      name: name,
      year: year,
      calendar: JSON.stringify(arrCalendar)
    });

    await calendar.save();
    
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

exports.updateCalendar = async (req, res, next) => {
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
    const results = await Calendar.find().sort({created_at: -1});

    // 3) bentuk response data dan set status code = 200
    let r = [];
    Object.keys(results).forEach((i) => {
      r.push({
        _id: results[i]._id,
        index: i,
        name: results[i].name,
        year: results[i].year,
        status: results[i].status,
        created_at: results[i].created_at
      });
    });
    data = {
      values: r
    };
    status = 200;
  } catch (err) {
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

    const calendar = await Calendar.findById(id);
    if (!calendar) throw new Error(calendar_not_found);
    calendar.status = req.body.status ? 1 : (2 || calendar.status);

    await Calendar.updateMany({}, {
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

exports.getOneCalendar = async (req, res, next) => {
  let { status, data, error, stack } = returnData();

  try {
    // 1) query data calendar aktif
    const result = await Calendar.findOne({ status: 1 }).lean();
    if (!result) throw new Error(bad_request);
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
    console.log(err)
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}