const CHANNELS = require('../constants/channels');
const redisService = require('../services/redisService');

const handleMqttMessage = async (topic, message, io) => {

  if (topic.includes('control')) return;

  const msgString = message.toString();
  console.log(`[MQTT IN] ${topic}: ${msgString}`);

  io.emit(CHANNELS.SOCKET.SENSOR_RAW, {
    topic: topic,
    message: msgString,
    timestamp: new Date().toISOString()
  });

  try {
    const redisPub = redisService.getPublisher();
    
    const parts = topic.split('/');
    
    if (parts.length < 4) {

        console.warn(`[MQTT WARNING] Format topik lama terdeteksi: ${topic}. Update alat IoT Anda!`);
        return; 
    }

    const areaId = parts[2]; 
    const slotName = parts[3]; 

    const sensorPayload = {
      areaId: areaId,  
      slotName: slotName,
      value: msgString
    };

    await redisPub.publish(CHANNELS.REDIS.SENSOR_PUB, JSON.stringify(sensorPayload));
    
  } catch (err) {
    console.error('[MQTT HANDLER ERROR]', err);
  }
};

module.exports = { handleMqttMessage };