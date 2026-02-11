const { createClient } = require('redis');
const config = require('../config/config');

const initRedis = async () => {
  const subscriber = createClient({ url: `redis://${config.redisHost}:6379` });
  
  subscriber.on('error', (err) => console.error('[RedisError]', err));
  
  await subscriber.connect();
  console.log('Terhubung ke Redis Subscriber');
  
  return subscriber;
};

module.exports = { initRedis };