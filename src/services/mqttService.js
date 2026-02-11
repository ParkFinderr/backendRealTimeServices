const mqtt = require('mqtt');
const config = require('../config/config');

const initMqtt = () => {
  const client = mqtt.connect(`mqtt://${config.mqttHost}:1883`);

  client.on('connect', () => {
    console.log('Terhubung ke MQTT Broker');
    client.subscribe(config.mqttTopicSensor);
  });

  client.on('error', (err) => {
    console.error('[MQTT ERROR]', err);
  });

  return client;
};

module.exports = { initMqtt };