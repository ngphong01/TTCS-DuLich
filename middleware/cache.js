const { getCache, setCache, isCacheEnabled } = require('../lib/redis');

/**
 * Cache responses for read-heavy routes
 * @param {Object} options
 * @param {number} options.ttl - TTL in seconds
 * @param {string} options.keyPrefix - prefix for cache key
 * @param {(req: import('express').Request) => string} options.keyBuilder - custom key builder
 * @param {(req: import('express').Request) => boolean} options.skip - skip cache condition
 */
function cacheResponse(options = {}) {
  return async (req, res, next) => {
    try {
      if (
        !isCacheEnabled() ||
        (typeof options.skip === 'function' && options.skip(req))
      ) {
        return next();
      }

      const key =
        (typeof options.keyBuilder === 'function' && options.keyBuilder(req)) ||
        `${options.keyPrefix || 'cache'}:${req.originalUrl}`;

      const cached = await getCache(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }

      res.setHeader('X-Cache', 'MISS');
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        originalJson(body);
        setCache(key, body, options.ttl).catch((err) =>
          console.warn('⚠️  Failed to set cache', err.message)
        );
        return res;
      };

      return next();
    } catch (error) {
      console.warn('⚠️  Cache middleware error:', error.message);
      return next();
    }
  };
}

module.exports = cacheResponse;

