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
      console.log(`[REDIS CMD] ${payload.action} -> ${payload.slotName}`);

      const mqttMsg = getMqttCommand(payload.action);
      if (mqttMsg) {
        const topic = `${CHANNELS.MQTT.CONTROL_PUB_PREFIX}${payload.slotName}`;
        mqttClient.publish(topic, mqttMsg);
        console.log(`[MQTT OUT] ${topic}: ${mqttMsg}`);
      }

      io.emit(CHANNELS.SOCKET.MAP_UPDATE, {
        slotName: payload.slotName,
        action: payload.action,
        status: payload.status
      });

      if (payload.action === 'reserveSlot' && payload.expiryTime) {
        io.emit(CHANNELS.SOCKET.TIMER_START, payload);
      }

      if (payload.action === 'cancelSlot' && payload.reason === 'timeout') {
        io.emit(CHANNELS.SOCKET.FORCE_RELEASE, {
          slotId: payload.slotId,
          slotName: payload.slotName,
          message: 'Waktu booking habis.'
        });
      }
    }

    if (channel === CHANNELS.REDIS.STATS) {
      io.emit(CHANNELS.SOCKET.STATS_UPDATE, payload);
    }

  } catch (err) {
    console.error('[REDIS HANDLER ERROR]', err);
  }
};

module.exports = { handleRedisMessage };