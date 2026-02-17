require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const CHANNELS = require('./constants/channels');
const mqttService = require('./services/mqttService');
const redisService = require('./services/redisService');
const mqttHandler = require('./handlers/mqttHandler');
const redisHandler = require('./handlers/redisHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'ParkFinder Realtime Service Berjalan....', 
    serverTime: new Date() 
  });
});

const startServer = async () => {
  try {
    console.log('Memulai realtime service...');

    const mqttClient = mqttService.connect();
    const redisSubscriber = await redisService.connectSubscriber();
    await redisService.connectPublisher(); 

    const mqttTopic = 'parkfinder/sensor/#'; 
    
    mqttClient.subscribe(mqttTopic, (err) => {
      if (!err) console.log(`Terhubung dengan MQTT Topic: ${mqttTopic}`);
      else console.error('Gagal subscribe MQTT:', err);
    });
    
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
      console.log(`Client Terhubung: ${socket.id}`);
      
      socket.on('joinArea', (areaId) => {
          if (areaId) {
              const roomName = `area_${areaId}`;
              socket.join(roomName);
              console.log(`Socket ${socket.id} joined AREA room: ${roomName}`);
          }
      });

      socket.on('leaveArea', (areaId) => {
          if (areaId) {
              const roomName = `area_${areaId}`;
              socket.leave(roomName);
              console.log(`Socket ${socket.id} left AREA room: ${roomName}`);
          }
      });

      socket.on('joinUser', (userId) => {
          if (userId) {
              const roomName = `user_${userId}`;
              socket.join(roomName);
              console.log(`Socket ${socket.id} joined USER room: ${roomName}`);
          }
      });

      socket.on('disconnect', () => {
        console.log(`Client Terputus: ${socket.id}`);
      });
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Realtime Service berjalan ${PORT}`);
    });

  } catch (err) {
    console.error('Gagal memulai server:', err);
    process.exit(1);
  }
};

startServer();