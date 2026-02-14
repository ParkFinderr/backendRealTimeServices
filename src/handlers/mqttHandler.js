const CHANNELS = require('../constants/channels');
const redisService = require('../services/redisService');

const handleMqttMessage = async (topic, message, io) => {

  if (topic.includes('control')) return;

  const msgString = message.toString();
  console.log(`[MQTT IN] ${topic}: ${msgString}`);

  // dashboard admin data
  io.emit(CHANNELS.SOCKET.SENSOR_RAW, {
    topic: topic,
    message: msgString,
    timestamp: new Date().toISOString()
  });

  // publish ke redis
  try {
    const redisPub = redisService.getPublisher();
    const slotName = topic.split('/').pop();

    const sensorPayload = {
      slotName: slotName,
      value: msgString
    };

    await redisPub.publish(CHANNELS.REDIS.SENSOR_PUB, JSON.stringify(sensorPayload));
  } catch (err) {
    console.error('[MQTT HANDLER ERROR]', err);
  }
};

module.exports = { handleMqttMessage };