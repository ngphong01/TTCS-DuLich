const Redis = require('ioredis');

const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const DEFAULT_TTL = Number(process.env.CACHE_TTL_SECONDS || 300);

let client;

function getClient() {
  if (!REDIS_ENABLED) {
    return null;
  }

  if (!client) {
    client = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
    });

    client.on('error', (err) => {
      console.error('⚠️  Redis error:', err.message);
    });

    client.on('connect', () => {
      console.log('✅ Redis cache connected');
    });
  }

  return client;
}

async function getCache(key) {
  const redis = getClient();
  if (!redis) return null;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

async function setCache(key, value, ttl = DEFAULT_TTL) {
  const redis = getClient();
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
}

async function invalidateCache(key) {
  const redis = getClient();
  if (!redis) return;
  await redis.del(key);
}

async function invalidatePattern(pattern) {
  const redis = getClient();
  if (!redis) return;

  const stream = redis.scanStream({
    match: pattern,
    count: 100,
  });

  stream.on('data', (keys = []) => {
    if (keys.length) {
      redis.del(keys);
    }
  });

  return new Promise((resolve) => {
    stream.on('end', resolve);
    stream.on('close', resolve);
  });
}

function isCacheEnabled() {
  return !!getClient();
}

module.exports = {
  DEFAULT_TTL,
  getCache,
  setCache,
  invalidateCache,
  invalidatePattern,
  isCacheEnabled,
};

