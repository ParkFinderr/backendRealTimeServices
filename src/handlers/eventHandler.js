// backendRealTimeServices/src/handlers/eventHandler.js
const config = require('../config/config');

const setupEventHandlers = (redisSubscriber, mqttClient, io) => {
  
  const redisPublisher = redisSubscriber.duplicate();
  redisPublisher.connect().then(() => {
    console.log('Publisher khusus sensor berjalan.');
  });

  // fungsi mengirim ke mqtt
  redisSubscriber.subscribe(config.redisChannelCmd, (message) => {
    try {
      const payload = JSON.parse(message);
      console.log(`[REDIS] Cmd: ${payload.action} -> ${payload.slotName}`);

      let mqttMessage = '';
      const targetTopic = `parkfinder/control/${payload.slotName}`;

      switch (payload.action) {
    
        case 'reserveSlot': mqttMessage = 'setReserved'; break;
  
        case 'occupySlot': mqttMessage = 'setOccupied'; break;
   
        case 'leaveSlot': 
        case 'cancelSlot': mqttMessage = 'setAvailable'; break;
   
        case 'maintenanceSlot': mqttMessage = 'setOccupied'; break; 
  
        case 'alertSlot': mqttMessage = 'buzzerOn'; break;
      }

      if (mqttMessage) {
        mqttClient.publish(targetTopic, mqttMessage);
        console.log(`[MQTT OUT] Kirim ke ${targetTopic} : ${mqttMessage}`);
      }

      io.emit('updateMap', {
            slotName: payload.slotName,
            action: payload.action,
            status: payload.status
        }
      );

    } catch (error) {
      console.error('[REDIS ERROR] Gagal parse pesan:', error);
    }
  });

  // mengirim data daris sensor 
  mqttClient.on('message', async (topic, message) => {

    if (topic.includes('control')) return;

    const msgString = message.toString();
    console.log(`[MQTT IN] ${topic}: ${msgString}`);

    io.emit('sensorUpdate', {
      topic: topic,
      message: msgString,
      timestamp: new Date().toISOString()
    });

    try {
        const slotName = topic.split('/').pop(); 
        
        const sensorPayload = {
            slotName: slotName,
            value: msgString 
        };

        await redisPublisher.publish('parkfinderSensorUpdate', JSON.stringify(sensorPayload));
        
    } catch (err) {
        console.error('Gagal kirim update sensor:', err.message);
    }
  });
};

module.exports = { setupEventHandlers };