const express = require('express');
const Influx = require('influx');
const influx = require('../db/influx');
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

  const deviceName = req.query.deviceName;
  const from = req.query.from;
  const to = req.query.to;

  const whereClauses = [`"domain"='binary_sensor'`];

  if (!stringIsDefined(deviceName)) {
    return next(new Error("deviceName is required!"));
  }
  if (stringIsDefined(from)) {
    whereClauses.push(`time > '${toInfluxTime(from)}'`);
  }
  if (stringIsDefined(to)) {
    whereClauses.push(`time < '${toInfluxTime(to)}'`);
  }

  influx.query(`
    SELECT mean("value") AS "mean_value" 
    FROM "home_assistant"."autogen".${Influx.escape.quoted(deviceName)}
    WHERE ${whereClauses.join(" AND ")}
  `)
  .then(function(result) {
      res.send({ 
        result: result[0].mean_value
      });
    })
    .catch(err => {
      next(err);
    })
});

module.exports = router;
