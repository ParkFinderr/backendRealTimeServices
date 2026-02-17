const { createClient } = require('redis');
require('dotenv').config();

let subscriber = null;
let publisher = null;

const getConnectionUrl = () => {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = process.env.REDIS_PORT || 6379;
  const password = process.env.REDIS_PASSWORD;

  if (password) {
    return `redis://:${password}@${host}:${port}`;
  }
  
  return `redis://${host}:${port}`;
};

const connectSubscriber = async () => {
  const url = getConnectionUrl();
  
  console.log(`[REDIS SUB] Menghubungkan ke Redis host: ${process.env.REDIS_HOST}...`);
  
  subscriber = createClient({ url });
  subscriber.on('error', (err) => console.error('[REDIS SUB] Error:', err));
  
  await subscriber.connect();
  console.log('[REDIS SUB] Terhubung');
  return subscriber;
};

const connectPublisher = async () => {
  const url = getConnectionUrl();
  
  console.log(`[REDIS PUB] Menghubungkan ke Redis host: ${process.env.REDIS_HOST}...`);

  publisher = createClient({ url });
  publisher.on('error', (err) => console.error('[REDIS PUB] Error:', err));
  
  await publisher.connect();
  console.log('[REDIS PUB] Terhubung');
  return publisher;
};

const getPublisher = () => {
  if (!publisher) throw new Error("Redis Publisher belum diinisialisasi!");
  return publisher;
};

module.exports = { connectSubscriber, connectPublisher, getPublisher };