# fedex-sensor-api
Fedex project interface to gather sensor data

Quick and dirty API to take data that was dumped by [home-assistant](https://www.home-assistant.io/) into an [InfluxDB](https://github.com/influxdata/influxdb) database and filter them for consumption by other services for [Fedex day](https://www.scrum.org/resources/fedex-day-lighting-corporate-passion).

# Usage

## Endpoints

### GET /devices

Returns a list of devices that you can use to filter by in GET /temperature.

#### Example Response

```
{
	"result":[
		"Temperature Sensor 1",
		"Temperature Sensor",
		"BR Temp",
		"K Temp"
	]
}
```

### GET /temperature

#### Query Parameters

##### deviceName (optional)
The name of the device to filter by (e.g. 'K Temp').
##### type (optional)
Can be 'average', 'min', 'max', 'list'. Defaults to 'list'.
##### from (optional)
ISO 8601 date that sets the minimum date/time for an event to be returned.
##### to  (optional)
ISO 8601 date that sets the maximum date/time for an event to be returned.

#### Example Query

`/temperature?deviceName=K%20Temp&type=average&from=2018-07-12T02:03:19%2B00:00&to=2018-07-12T04:03:19%2B00:00`

#### Example Response

When the `type` query parameter is 'average', 'min' or 'max'

```
{
	"result": 20.3333
}
```

When the `type` query parameter is 'list' or undefined

```
{
	"result":[
		{"time":"2018-07-12T02:10:56.000Z","value":20.9},
		{"time":"2018-07-12T02:13:57.000Z","value":20.9},
		...
	]
}
```

# Setup

Create a `.env` at the root of your repo with the following entries (or just define them as environment variables).

INFLUX_HOST=<hostname of influx DB>
INFLUX_DB=<database name in influx DB>

Then run `npm start`
