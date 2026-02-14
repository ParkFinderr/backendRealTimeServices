const { createClient } = require('redis');
require('dotenv').config();

let subscriber = null;
let publisher = null;

const getConnectionUrl = () => {
  const host = process.env.REDIS_HOST
  const port = process.env.REDIS_PORT
  return `redis://${host}:${port}`;
};

const connectSubscriber = async () => {
  const url = getConnectionUrl();
  console.log(`[REDIS SUB] terhubung ke ${url}...`);
  
  subscriber = createClient({ url });
  subscriber.on('error', (err) => console.error('❌ [REDIS SUB] Error:', err));
  
  await subscriber.connect();
  console.log('[REDIS SUB] Terhubung ');
  return subscriber;
};

const connectPublisher = async () => {
  const url = getConnectionUrl();
  console.log(`[REDIS PUB] terhubung ke ${url}...`);

  publisher = createClient({ url });
  publisher.on('error', (err) => console.error('❌ [REDIS PUB] Error:', err));
  
  await publisher.connect();
  console.log('[REDIS PUB] terhubung');
  return publisher;
};

const getPublisher = () => {
  if (!publisher) throw new Error("Redis Publisher belum diinisialisasi!");
  return publisher;
};

module.exports = { connectSubscriber, connectPublisher, getPublisher };