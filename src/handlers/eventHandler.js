const config = require('../config/config');

const setupEventHandlers = (redisSubscriber, mqttClient, io) => {
  
  
  const redisPublisher = redisSubscriber.duplicate();

  const statsSubscriber = redisSubscriber.duplicate();

  Promise.all([
    redisPublisher.connect(),
    statsSubscriber.connect()
  ]).then(() => {
    console.log('Redis Publisher & Stats Subscriber Ready.');
  });


  // redis > mqtt > websocket
  redisSubscriber.subscribe(config.redisChannelCmd, (message) => {
    try {
      const payload = JSON.parse(message);
      console.log(`[REDIS CMD] ${payload.action} -> ${payload.slotName}`);

      let mqttMessage = '';
      const targetTopic = `parkfinder/control/${payload.slotName}`;

      switch (payload.action) {
        case 'reserveSlot': mqttMessage = 'setReserved'; break;
        case 'occupySlot': mqttMessage = 'setOccupied'; break;
        case 'leaveSlot': 
        case 'cancelSlot': 
        case 'freeSlot': mqttMessage = 'setAvailable'; break;
        case 'maintenanceSlot': mqttMessage = 'setMaintenance'; break; 
        case 'alertSlot': mqttMessage = 'actuatorOn'; break;
      }

      if (mqttMessage) {
        mqttClient.publish(targetTopic, mqttMessage);
        console.log(`[MQTT OUT] ${targetTopic} : ${mqttMessage}`);
      }

      io.emit('updateMap', {
            slotName: payload.slotName,
            action: payload.action,
            status: payload.status
      });

      if (payload.action === 'reserveSlot' && payload.expiryTime) {
          console.log(`[TIMER] Start countdown for ${payload.slotName}`);
          io.emit('bookingTimerStart', {
              slotId: payload.slotId,
              slotName: payload.slotName,
              expiryTime: payload.expiryTime
          });
      }


      if (payload.action === 'cancelSlot' && payload.reason === 'timeout') {
          console.log(`[ALERT] Force release for ${payload.slotName}`);
          io.emit('forceRelease', {
              slotId: payload.slotId,
              slotName: payload.slotName,
              message: 'Waktu booking Anda telah habis.'
          });
      }

    } catch (error) {
      console.error('[REDIS ERROR] Gagal parse pesan command:', error);
    }
  });


  //redis > websocket dashboard admin
  statsSubscriber.subscribe('parkfinderStats', (message) => {
      try {
          const stats = JSON.parse(message);

          io.emit('adminStatsUpdate', stats);
         
      } catch (err) {
          console.error('[STATS ERROR]', err);
      }
  });


  // mqtt > redis > webscoket
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