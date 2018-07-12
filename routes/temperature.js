const express = require('express');
const Influx = require('influx');
const influx = require('../db/influx');
const router = express.Router();

function stringIsDefined(val) {
  return typeof val === "string" && val.length > 0;
}

/*
time  "2018-07-12T01:54:21.006Z"
value 22.6
*/

const reducerFns = {
  'average': function(seriesData) {
    const values = seriesData.map((val) => val.value);
    return values.reduce((prev, curr) => prev + curr, 0) / values.length;
  },
  'min': function(seriesData) {
    const values = seriesData.map((val) => val.value);
    return Math.min(...values);
  },
  'max': function(seriesData) {
    const values = seriesData.map((val) => val.value);
    return Math.max(...values);
  },
  'list': function(seriesData) {
    return seriesData;
  }
};

// TODO: Work out more elegant way to do this
// See: https://node-influx.github.io/manual/usage.html#a-moment-for-times
function toInfluxTime(isoDateString) {
  console.log(isoDateString);
  const timeValue = new Date(isoDateString).getTime();
  const nanoTimeString = `${timeValue}000000`;
  console.log(nanoTimeString);
  return Influx.toNanoDate(nanoTimeString).toNanoISOString();
}

/* GET users listing. */
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

  const query = `
    SELECT value
    FROM "home_assistant"."autogen"."°C"
    WHERE ${whereClauses.join(" AND ")}
  `;
  console.log(`query: '${query}'`);
  influx.query(query, {precision: Influx.Precision.Seconds})
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
