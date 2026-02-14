require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');


const mqttService = require('./services/mqttService');
const redisService = require('./services/redisService');
const mqttHandler = require('./handlers/mqttHandler');
const redisHandler = require('./handlers/redisHandler');
const CHANNELS = require('./constants/channels');
const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const startServer = async () => {
  try {
 
    const mqttClient = mqttService.connect();
    const redisSubscriber = await redisService.connectSubscriber();
    await redisService.connectPublisher(); 

    console.log('Seluruh layanan terhubung');

    mqttClient.subscribe(CHANNELS.MQTT.SENSOR_SUB);
    
    mqttClient.on('message', (topic, message) => {
      mqttHandler.handleMqttMessage(topic, message, io);
    });

    await redisSubscriber.subscribe(CHANNELS.REDIS.CMD, (message) => {
        redisHandler.handleRedisMessage(CHANNELS.REDIS.CMD, message, io);
    });
    
    await redisSubscriber.subscribe(CHANNELS.REDIS.STATS, (message) => {
        redisHandler.handleRedisMessage(CHANNELS.REDIS.STATS, message, io);
    });

    io.on('connection', (socket) => {
      console.log(`🔌 Client Connected: ${socket.id}`);
      socket.on('disconnect', () => console.log(`🔌 Client Disconnected: ${socket.id}`));
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`✅ Realtime Service running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

startServer();