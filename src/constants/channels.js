module.exports = {
  // API <-> Realtime
  REDIS: {
    CMD: 'parkfinderCommands',         
    STATS: 'parkfinderStats',          
    SENSOR_PUB: 'parkfinderSensorUpdate'
  },

  /// realtime > IoT
  MQTT: {
    SENSOR_SUB: 'parkfinder/sensor/+/status',
    CONTROL_PUB_PREFIX: 'parkfinder/control/', 
    PAYLOAD: {
      RESERVED: 'setReserved',
      OCCUPIED: 'setOccupied',
      AVAILABLE: 'setAvailable',
      MAINTENANCE: 'setMaintenance',
      ALERT: 'actuatorOn'
    }
  },

  // realtime > frontend
  SOCKET: {
    MAP_UPDATE: 'updateMap',          
    TIMER_START: 'bookingTimerStart',  
    STATS_UPDATE: 'adminStatsUpdate'   
  }
};