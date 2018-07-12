const express = require('express');
const Influx = require('influx');
const influx = require('../db/influx');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  influx.query(`
    SELECT distinct("friendly_name_str")
    FROM "home_assistant"."autogen"."°C"
  `)
  .then(function(results) {
      res.send({ 
        result: results.map((result) => result.distinct)
      });
    })
    .catch(err => {
      next(new Error(err));
    })
});

module.exports = router;
