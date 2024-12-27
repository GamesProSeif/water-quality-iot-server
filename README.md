## HTTP Routes

#### 1. GET: `/temp`

Returns: current temperature

Example Response:
```js
{
	"temp": 20.3
}
```

#### 2. GET: `/settings`

Returns: settings

Example Response:
```js
{
	"min": 15, // minimum value for temperature
	"max": 30, // maximum value for temperature
	"buzzerMode": true // whether buzzer should send alerts or be turned off
}
```

#### 3. POST: `/config`

Changes config settings
Returns: updated key/value

Example Request Body:
```js
{
	"key": "min", // Key to change ("min" | "max" | "buzzerMode")
	"value": 14 // Value to update (number for "min", "max" - boolean for "buzzerMode")
}
```


Example Response:
```js
{
	"key": "min", // Changed key
	"value": 14 // Updated value
}
```

---

## MQTT Protocol

#### ESP -> Server

##### 1. Current Temperature

Send current temperature to server

Example message:
```
temp:20.3
```

#### Server -> ESP

##### 1. Trigger Buzzer

Event triggered when temperature goes out of range and `buzzerMode` is true.
When this event is triggered, the buzzer should turn on.

Example message:
```
trigger_buzzer
```

##### 2. Disable Buzzer

Event triggered when temperature goes in range (after being out of range) or when the user disables the buzzer from the app while the buzzer is on.
When this event is triggered, the buzzer (currently on) should be turned off.

Example message:
```
disable_buzzer
```

---
## General Notes

- Free hosted [HiveMQ](https://www.hivemq.com/) MQTT Broker was used for testing.
- No database was used in this application and everything was stored in RAM to optimize performance.
- This backend server was designed to be ran 24/7

---
## Installing and Running the Server

1. Install [NodeJS v21.x.x](https://nodejs.org/en/download/prebuilt-installer)
2. Clone the repository using git or download it
```
git clone https://github.com/GamesProSeif/water-quality-iot-server.git
```

3. Install packages
```
npm install
```

4. Build the server
```
npm run build
```

5. Run the server
```
npm start
```
