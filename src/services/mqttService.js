const mqtt = require('mqtt');
require('dotenv').config();

let client = null;

const connect = () => {
  const host = process.env.MQTT_HOST
  const port = process.env.MQTT_PORT
  const url = `mqtt://${host}:${port}`;

  console.log(`[MQTT] Connecting to ${url}...`);
  
  client = mqtt.connect(url);

  client.on('connect', () => {
    console.log(`✅ [MQTT] Connected`);
  });

  client.on('error', (err) => {
    console.error('❌ [MQTT] Error:', err.message);
  });

  return client;
};

const getClient = () => {
  if (!client) throw new Error("MQTT Client belum diinisialisasi!");
  return client;
};

module.exports = { connect, getClient };