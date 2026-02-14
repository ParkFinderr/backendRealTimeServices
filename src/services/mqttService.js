const mqtt = require('mqtt');
require('dotenv').config();

let client = null;

const connect = () => {
  const host = process.env.MQTT_HOST
  const port = process.env.MQTT_PORT 
  
  client = mqtt.connect(`mqtt://${host}:${port}`);

  client.on('connect', () => {
    console.log(`✅ MQTT terhubung  ${host}:${port}`);
  });

  client.on('error', (err) => {
    console.error('❌ MQTT Error:', err);
  });

  return client;
};

const getClient = () => {
  if (!client) throw new Error("MQTT Client tidak terhubung");
  return client;
};

module.exports = { connect, getClient };