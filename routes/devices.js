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
function magicalEnhancmentFunction(nameObj) {

  const {friendlyName, deviceId} = nameObj;

  const invalidDevice = (friendlyName) => ({
    room: "Invalid Room",
    sensor_type: "Invalid Sensor",
    unit: "Invalid Unit",
    friendly_name: friendlyName,
    sensor_id: "invalid_id",
    deviceId: "device_id"
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
    friendly_name: friendlyName,
    deviceId: deviceId
  };
}

router.get('/', function(req, res, next) {
  // TODO: OMG MY EYES!!!! Please help me
  influx.query(`
    SHOW MEASUREMENTS
  `)
  .then(function(results) {
      const queries = results
        .map((result) => result.name)
        .filter((name) => name.match(/binary_sensor.+motion.+/))
        .map((name) => {
          return influx.query(`
            SELECT distinct("friendly_name_str")
            FROM "home_assistant"."autogen"."${name}"
          `)
          .then((friendlyNameResult) => ({
              friendlyName: friendlyNameResult[0].distinct,
              deviceID: name
          }));
        });
      return Promise.all(queries)
    })
    .then(motionResults => {
      return influx.query(`
        SELECT distinct("friendly_name_str")
        FROM "home_assistant"."autogen"."°C"
      `)
      .then((tempResults) => motionResults.concat(tempResults.map(result => ({
        friendlyName: result.distinct,
        deviceID: ''
      }))))
    })
    .then((concatinatedResults) => {
       res.send({ 
         result: concatinatedResults.map(concatinatedResult => 
          magicalEnhancmentFunction(concatinatedResult))
      });
    })
    .catch(err => {
      next(new Error(err));
    });
});

module.exports = router;
