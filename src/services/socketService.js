const { Server } = require('socket.io');

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  return io;
};

module.exports = { initSocket };