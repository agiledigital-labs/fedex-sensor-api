var express = require('express');
var router = express.Router()
var influx = require('../db/influx');

/* GET users listing. */
router.get('/', function(req, res, next) {
	//time > now() - 1h 
	//	AND 

  influx.query(`
	SELECT value
	FROM "home_assistant"."autogen"."°C" 
	WHERE "domain"='sensor'
  `)
 	.then(function(results) {
  	  res.send(results);
  	})
  	.catch(err => {
  	  console.dir(err);
      next(err);
    })
});

module.exports = router;
