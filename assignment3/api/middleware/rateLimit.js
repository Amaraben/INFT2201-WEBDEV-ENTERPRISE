// Very simple in-memory rate limiter for demo purposes.
// Requirements (from assignment spec):
// - Track requests per IP OR per user (token), your choice.
// - Limit to RATE_LIMIT_MAX requests per RATE_LIMIT_WINDOW_SECONDS.
// - When exceeded, produce an error (429 Too Many Requests) via next(err).
// - Include a Retry-After header in the final response (set that in errorHandler).

const windowMs = (parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) || 60) * 1000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX, 10) || 5;

const buckets = new Map();
// shape: key -> { count, windowStart }
// TODO: implement a simple rolling or fixed-window rate limiting strategy.

module.exports = function rateLimit(req, res, next) {
  // - Decide on a key: IP-based (req.ip) OR token-based (req.user?.userId).
  const key = req.ip; 
  const now = Date.now();
  
  // - Track count within a time window.
  if (!buckets.has(key))  {
    buckets.set(key, { count: 1, windowStart: now });
    return next();
  }

  const bucket = buckets.get(key);
  
  if (now - bucket.windowStart > windowMs) {
    bucket.count = 1;
    bucket.windowStart = now;
    return next();
  }
  
  bucket.count++;
  
  // - On exceed, create a rate-limit error and pass to next(err).
  if (bucket.count > maxRequests) {
    const err = new Error ("Too many request. Please try again later")
    err.statusCode = 429;
    err.name = "Rate Limit Error";
    
    res.setHeader('Retry-After', Math.ceil(windowMs / 1000));

  
    return next (err);
  }
  next();

};