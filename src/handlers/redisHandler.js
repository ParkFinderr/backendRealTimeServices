const CHANNELS = require('../constants/channels');
const mqttService = require('../services/mqttService');

const getMqttCommand = (action) => {
  switch (action) {
    case 'reserveSlot': return CHANNELS.MQTT.PAYLOAD.RESERVED;
    case 'occupySlot': return CHANNELS.MQTT.PAYLOAD.OCCUPIED;
    case 'leaveSlot': 
    case 'cancelSlot': return CHANNELS.MQTT.PAYLOAD.AVAILABLE;
    case 'maintenanceSlot': return CHANNELS.MQTT.PAYLOAD.MAINTENANCE;
    case 'alertSlot': return CHANNELS.MQTT.PAYLOAD.ALERT;
    default: return null;
  }
};

const handleRedisMessage = (channel, message, io) => {
  try {

    const payload = JSON.parse(message); 
    const mqttClient = mqttService.getClient();

    if (channel === CHANNELS.REDIS.CMD) {
      console.log(`[REDIS CMD] ${payload.action} -> ${payload.slotName} (Area: ${payload.areaId})`);

      const mqttMsg = getMqttCommand(payload.action);
      
      if (mqttMsg) {
        let topic = '';
        if (payload.areaId) {
            topic = `${CHANNELS.MQTT.CONTROL_PUB_PREFIX}${payload.areaId}/${payload.slotName}`;
        } else {
            topic = `${CHANNELS.MQTT.CONTROL_PUB_PREFIX}${payload.slotName}`;
        }
        
        mqttClient.publish(topic, mqttMsg);
        console.log(`[MQTT OUT] ${topic}: ${mqttMsg}`);
      }

      if (payload.areaId) {
          io.to(`area_${payload.areaId}`).emit(CHANNELS.SOCKET.MAP_UPDATE, {
            slotName: payload.slotName,
            action: payload.action,
            status: payload.status,
            areaId: payload.areaId
          });
      } else {
        
          io.emit(CHANNELS.SOCKET.MAP_UPDATE, payload);
      }

      if (payload.action === 'reserveSlot' && payload.expiryTime) {
         if (payload.areaId) {
            io.to(`area_${payload.areaId}`).emit(CHANNELS.SOCKET.TIMER_START, payload);
         }
      }

      if (payload.action === 'cancelSlot' && payload.reason === 'timeout') {
    
         if (payload.areaId) {
             io.to(`area_${payload.areaId}`).emit(CHANNELS.SOCKET.FORCE_RELEASE, {
                slotId: payload.slotId,
                slotName: payload.slotName,
                message: 'Waktu booking habis.'
             });
         }
      }
    }

    if (channel === CHANNELS.REDIS.STATS) {

      if (payload.areaId && payload.areaId !== 'GLOBAL') {
          io.to(`area_${payload.areaId}`).emit(CHANNELS.SOCKET.STATS_UPDATE, payload.stats);
      } else {
          io.emit(CHANNELS.SOCKET.STATS_UPDATE, payload); 
      }
    }

  } catch (err) {
    console.error('[REDIS HANDLER ERROR]', err);
  }
};

module.exports = { handleRedisMessage };