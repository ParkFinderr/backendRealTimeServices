require('dotenv').config();

module.exports = {
  mqttHost: process.env.MQTT_HOST,
  redisHost: process.env.REDIS_HOST,
  port: process.env.PORT,
  mqttTopicSensor: 'parkfinder/sensor/#',
  redisChannelCmd: 'parkfinderCommands'
};