const express = require('express');
const Influx = require('influx');
const influx = require('../db/influx');
const router = express.Router();
const reducerFns = require('../utils/reducer-functions');

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

router.get('/', function(req, res, next) {

  const deviceName = req.query.deviceName;
  const from = req.query.from;
  const to = req.query.to;
  const type = req.query.type;

  const whereClauses = [`"domain"='sensor'`];

  if (stringIsDefined(deviceName)) {
    whereClauses.push(`"friendly_name_str"=${Influx.escape.stringLit(deviceName)}`);
  }
  if (stringIsDefined(from)) {
    whereClauses.push(`time > '${toInfluxTime(from)}'`);
  }
  if (stringIsDefined(to)) {
    whereClauses.push(`time < '${toInfluxTime(to)}'`);
  }

  influx.query(`
    SELECT value, friendly_name_str
    FROM "home_assistant"."autogen"."lx"
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
