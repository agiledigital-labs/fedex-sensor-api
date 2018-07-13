const express = require('express');
const Influx = require('influx');
const influx = require('../db/influx');
const reducerFns = require('../utils/reducer-functions');
const router = express.Router();

function stringIsDefined(val) {
  return typeof val === "string" && val.length > 0;
}

// TODO: Work out more elegant way to do this
// See: https://node-influx.github.io/manual/usage.html#a-moment-for-times
function toInfluxTime(isoDateString) {
  const timeValue = new Date(isoDateString).getTime();
  const nanoTimeString = `${timeValue}000000`;
  return Influx.toNanoDate(nanoTimeString).toNanoISOString();
}

/* GET users listing. */
router.get('/', function(req, res, next) {

  const deviceId = req.query.deviceId;
  const from = req.query.from;
  const to = req.query.to;
  const type = req.query.type;

  const whereClauses = [`"domain"='binary_sensor'`];

  if (!stringIsDefined(deviceId)) {
    return next(new Error("deviceId is required!"));
  }
  if (stringIsDefined(from)) {
    whereClauses.push(`time > '${toInfluxTime(from)}'`);
  }
  if (stringIsDefined(to)) {
    whereClauses.push(`time < '${toInfluxTime(to)}'`);
  }

  influx.query(`
    SELECT value
    FROM "home_assistant"."autogen".${Influx.escape.quoted(deviceId)}
    WHERE ${whereClauses.join(" AND ")}
  `)
  .then(function(results) {
    const reducerFn = reducerFns[type] || reducerFns.list;
    res.send({ 
      result: reducerFn(results)
    });
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;
