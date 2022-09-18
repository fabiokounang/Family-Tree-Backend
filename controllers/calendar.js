const getDaysInMonth = require("../helper-function/get-days-in-month");
const handleError = require("../helper-function/handle-error");
const returnData = require("../helper-function/return-data");
const sendResponse = require("../helper-function/send-response");
const Calendar = require("../model/calendar");

const { calendar_not_found, bad_request, event_name_required } = require("../utils/error-message");
const { createLog } = require("./log");

exports.createCalendar = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    // 1) create calendar
    const date = new Date();
    const currentYear = date.getFullYear();

    let arrCalendar = {};
    for (let i = 1; i <= 12; i++) {
      const daysInCurrentMonth = getDaysInMonth(currentYear, i);
      Array.from(Array(daysInCurrentMonth + 1).keys()).slice(1).forEach((day) => {
        arrCalendar[i] = Object.assign({}, arrCalendar[i], {
          [day]: []
        })
      });
    }

    // 2) query create calendar exist / tidak
    const calendar = new Calendar({
      name: req.body.name,
      calendar: JSON.stringify(arrCalendar)
    });

    await calendar.save();

    // 4) bentuk response data dan set status code = 201
    status = 201;

    createLog(req.user_id, 'create new calendar');
  } catch (err) {
    stack = err.message || err.stack || err;
    error = handleError(err);
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateCalendar = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    const id = req.params.id;

    const calendar = await Calendar.findById(id).lean();
    if (!calendar) throw new Error(calendar_not_found);
    
    calendar.calendar = JSON.parse(calendar.calendar);

    const isNotValid = req.body.events.find(val => !val.name);
    if (isNotValid) throw new Error(event_name_required);

    calendar.calendar[req.body.month][req.body.day] = req.body.events;

    await Calendar.updateOne({ _id : id }, {
      $set: {
        name: req.body.name,
        calendar: JSON.stringify(calendar.calendar)
      }
    });

    status = 204;

    createLog(req.user_id, 'update calendar');

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
    const id = req.params.id;
    await Calendar.deleteOne({_id: id});
    status = 204;
    createLog(req.user_id, 'delete calendar');
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
    const results = await Calendar.find();

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
    createLog(req.user_id, 'update status calendar');

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
    const id = req.params.id;
    if (!id) throw new Error(bad_request);

    // 1) query data dan query count total
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