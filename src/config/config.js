require('dotenv').config();

module.exports = {
  mqttHost: process.env.MQTT_HOST,
  redisHost: process.env.REDIS_HOST,
  port: process.env.PORT || 3000,
  mqttTopicSensor: 'parkfinder/sensor/#',
  redisChannelCmd: 'parkfinder-commands'
};