var express = require('express');
var router = express.Router()
var influx = require('../db/influx');

/* GET users listing. */
router.get('/', function(req, res, next) {
  influx.query(`
	SELECT mean("value") AS "mean_value" 
	FROM "home_assistant"."autogen"."°C" 
	WHERE time > now() - 1h 
		AND "domain"='sensor'
	GROUP BY time(10s) 
	FILL(null)
  `)
 	.then(function(results) {
  		next(results);
  	});
});

module.exports = router;
