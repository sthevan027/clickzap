const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const rateLimit = (windowMs = 60000, max = 100) => {
  return async (req, res, next) => {
    try {
      const key = `rate_limit:${req.ip}`;
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowMs / 1000);
      }

      if (current > max) {
        return res.status(429).json({
          error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
          retryAfter: windowMs / 1000
        });
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - current);
      res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + (windowMs / 1000));

      next();
    } catch (error) {
      console.error('Erro no rate limiting:', error);
      next();
    }
  };
};

module.exports = rateLimit; 