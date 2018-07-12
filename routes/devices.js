const express = require('express');
const Influx = require('influx');
const influx = require('../db/influx');
const router = express.Router();
const friendlyMappings = require('../utils/friendly-mappings');
const unitMappings = require('../utils/unit-mapping');



// The friendly name is not friendly enough for
// Alexa so we need to make it more friendly in here.
// Ideally we could export more metadata from our sensors
// to the DB such as room name but we can't work it out
// right now so this will do. 
function magicalEnhancmentFunction(friendlyName) {

  const invalidDevice = (friendlyName) => ({
    room: "Invalid Room",
    sensor_type: "Invalid Sensor",
    unit: "Invalid Unit",
    friendly_name: friendlyName
  });

  if (typeof friendlyName != 'string') {
    return invalidDevice(friendlyName);
  }
  const components = friendlyName.split(" ");
  if (components.length != 2) {
    return invalidDevice(friendlyName);
  }

  [roomCode, sensorCode] = components;
  const friendlyRoom = friendlyMappings[roomCode.toLowerCase()] || "G g g ghost Room";
  const friendlySensorType = friendlyMappings[sensorCode.toLowerCase()] || "Mystery Sensor";
  const unit = unitMappings[sensorCode.toLowerCase()] || "Phantom Units";

  return {
    room: friendlyRoom,
    sensor_type: friendlySensorType,
    unit: unit,
    friendly_name: friendlyName
  };
}

router.get('/', function(req, res, next) {
  influx.query(`
    SELECT distinct("friendly_name_str")
    FROM "home_assistant"."autogen"."°C"
  `)
  .then(function(results) {
      res.send({ 
        result: results.map((result) => magicalEnhancmentFunction(result.distinct))
      });
    })
    .catch(err => {
      next(new Error(err));
    })
});

module.exports = router;
