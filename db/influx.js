const Influx = require('influx');

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST,
  database: process.env.INFLUX_DB
});

module.exports = influx;