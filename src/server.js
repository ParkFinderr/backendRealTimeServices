const express = require('express');
const http = require('http');
const cors = require('cors');
const config = require('./config/config');

// Import Routes & Services
const apiRoutes = require('./routes/apiRoutes');
const { initRedis } = require('./services/redisService');
const { initMqtt } = require('./services/mqttService');
const { initSocket } = require('./services/socketService');
const { setupEventHandlers } = require('./handlers/eventHandler');

const startServer = async () => {
  try {
    console.log('[INIT] Starting Realtime Service...');

    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use('/', apiRoutes);

    const httpServer = http.createServer(app);

    const redisSubscriber = await initRedis();
    const mqttClient = initMqtt();
    const io = initSocket(httpServer); // Tempel Socket.io ke server HTTP

    setupEventHandlers(redisSubscriber, mqttClient, io);

    httpServer.listen(config.port, () => {
      console.log(`Realtime Service berjalan di Port ${config.port}`);
      console.log(`   - HTTP API: Ready`);
      console.log(`   - WebSocket: Ready`);
      console.log(`   - MQTT Bridge: Ready`);
    });

  } catch (error) {
    console.error('[FATAL ERROR]', error);
    process.exit(1);
  }
};

startServer();