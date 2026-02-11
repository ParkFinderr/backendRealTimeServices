const config = require('../config/config');

const setupEventHandlers = (redisSubscriber, mqttClient, io) => {
  
  //  listen redis
  redisSubscriber.subscribe(config.redisChannelCmd, (message) => {
    try {
      const payload = JSON.parse(message);
      console.log(`[REDIS] Cmd: ${payload.action} -> ${payload.slotName}`);

      const targetTopic = `parkfinder/control/${payload.slotName}`;
      let mqttMessage = '';

      switch (payload.action) {
        case 'reserveSlot': mqttMessage = 'LedYellowOn'; break;
        case 'occupySlot': mqttMessage = 'LedRedOn'; break;
        case 'cancelSlot': mqttMessage = 'LedGreenOn'; break;
        case 'maintenanceSlot': mqttMessage = 'LedRedBlink'; break;
      }

      if (mqttMessage) {
        mqttClient.publish(targetTopic, mqttMessage);
        io.emit('updateDenah', payload);
      }
    } catch (err) {
      console.error('[RedisError]', err);
    }
  });

  // listen mqtt
  mqttClient.on('message', (topic, message) => {
    if (topic.includes('control')) return;

    const msgString = message.toString();
    console.log(`[MQTT] ${topic}: ${msgString}`);

    io.emit('sensorUpdate', {
      topic: topic,
      message: msgString,
      timestamp: new Date().toISOString()
    });
  });
};

module.exports = { setupEventHandlers };