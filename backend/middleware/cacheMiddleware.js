/**
 * Cache Middleware - Express middleware for API response caching
 * Automatically caches API responses with configurable TTL and invalidation
 */

const cacheService = require('../services/cacheService');

/**
 * Create cache middleware with options
 * @param {object} options - Cache configuration options
 * @param {number} options.ttl - Time to live in milliseconds (default: 5 minutes)
 * @param {string[]} options.tags - Tags for cache invalidation
 * @param {function} options.keyGenerator - Custom key generator function
 * @param {function} options.shouldCache - Function to determine if response should be cached
 * @returns {function} Express middleware function
 */
function createCacheMiddleware(options = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    tags = [],
    keyGenerator = defaultKeyGenerator,
    shouldCache = defaultShouldCache
  } = options;

  return (req, res, next) => {
    // Generate cache key
    const cacheKey = keyGenerator(req);
    
    // Try to get cached response
    const cachedResponse = cacheService.get(cacheKey);
    
    if (cachedResponse) {
      // Return cached response
      res.set(cachedResponse.headers || {});
      res.status(cachedResponse.status || 200);
      res.json(cachedResponse.data);
      return;
    }

    // Store original res.json method
    const originalJson = res.json;
    const originalStatus = res.status;
    const originalSet = res.set;
    
    let responseStatus = 200;
    let responseHeaders = {};

    // Override res.status to capture status code
    res.status = function(code) {
      responseStatus = code;
      return originalStatus.call(this, code);
    };

    // Override res.set to capture headers
    res.set = function(field, value) {
      if (typeof field === 'object') {
        Object.assign(responseHeaders, field);
      } else {
        responseHeaders[field] = value;
      }
      return originalSet.call(this, field, value);
    };

    // Override res.json to cache the response
    res.json = function(data) {
      // Check if response should be cached
      if (shouldCache(req, res, data, responseStatus)) {
        const responseToCache = {
          data,
          status: responseStatus,
          headers: responseHeaders,
          timestamp: Date.now()
        };

        // Cache with tags if provided
        if (tags.length > 0) {
          cacheService.setWithTags(cacheKey, responseToCache, tags, ttl);
        } else {
          cacheService.set(cacheKey, responseToCache, ttl);
        }
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Default cache key generator
 * @param {object} req - Express request object
 * @returns {string} Cache key
 */
function defaultKeyGenerator(req) {
  const { method, originalUrl, query, body } = req;
  const queryString = Object.keys(query).length > 0 ? JSON.stringify(query) : '';
  const bodyString = method !== 'GET' && body ? JSON.stringify(body) : '';
  
  return `api:${method}:${originalUrl}:${queryString}:${bodyString}`;
}

/**
 * Default function to determine if response should be cached
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {number} status - Response status code
 * @returns {boolean} Whether to cache the response
 */
function defaultShouldCache(req, res, data, status) {
  // Only cache successful GET requests
  return req.method === 'GET' && status >= 200 && status < 300;
}

/**
 * Middleware specifically for dashboard data caching
 */
const dashboardCache = createCacheMiddleware({
  ttl: 5 * 60 * 1000, // 5 minutes
  tags: ['dashboard', 'stats'],
  keyGenerator: (req) => `dashboard:${req.originalUrl}:${JSON.stringify(req.query)}`
});

/**
 * Middleware for meter data caching
 */
const meterCache = createCacheMiddleware({
  ttl: 10 * 60 * 1000, // 10 minutes
  tags: ['meters', 'readings'],
  keyGenerator: (req) => `meters:${req.originalUrl}:${JSON.stringify(req.query)}`
});

/**
 * Middleware for facility data caching
 */
const facilityCache = createCacheMiddleware({
  ttl: 15 * 60 * 1000, // 15 minutes
  tags: ['facilities'],
  keyGenerator: (req) => `facilities:${req.originalUrl}:${JSON.stringify(req.query)}`
});

/**
 * Middleware for heating data caching
 */
const heatingCache = createCacheMiddleware({
  ttl: 8 * 60 * 1000, // 8 minutes
  tags: ['heating', 'readings'],
  keyGenerator: (req) => `heating:${req.originalUrl}:${JSON.stringify(req.query)}`
});

/**
 * Cache invalidation middleware for POST/PUT/DELETE requests
 * @param {string[]} tags - Tags to invalidate
 */
function createInvalidationMiddleware(tags) {
  return (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override response methods to invalidate cache after successful operations
    const invalidateAndRespond = function(data) {
      // Only invalidate on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.invalidateByTags(tags);
        console.log(`Cache invalidated for tags: [${tags.join(', ')}]`);
      }
      return data;
    };

    res.json = function(data) {
      invalidateAndRespond(data);
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      invalidateAndRespond(data);
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Invalidation middleware for meter operations
 */
const invalidateMeters = createInvalidationMiddleware(['meters', 'readings', 'dashboard', 'stats']);

/**
 * Invalidation middleware for facility operations
 */
const invalidateFacilities = createInvalidationMiddleware(['facilities', 'dashboard', 'stats']);

/**
 * Invalidation middleware for heating operations
 */
const invalidateHeating = createInvalidationMiddleware(['heating', 'readings', 'dashboard', 'stats']);

/**
 * Invalidation middleware for maintenance operations
 */
const invalidateMaintenance = createInvalidationMiddleware(['maintenance', 'dashboard', 'stats']);

/**
 * Invalidation middleware for task operations
 */
const invalidateTasks = createInvalidationMiddleware(['tasks', 'dashboard', 'stats']);

module.exports = {
  createCacheMiddleware,
  dashboardCache,
  meterCache,
  facilityCache,
  heatingCache,
  createInvalidationMiddleware,
  invalidateMeters,
  invalidateFacilities,
  invalidateHeating,
  invalidateMaintenance,
  invalidateTasks
};