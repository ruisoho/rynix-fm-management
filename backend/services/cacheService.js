/**
 * Cache Service - In-memory caching with TTL and invalidation strategies
 * Provides caching for dashboard data, API responses, and other frequently accessed data
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = this.defaultTTL) {
    // Clear existing timer if key already exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store the value with timestamp
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);

    console.log(`Cache SET: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    console.log(`Cache HIT: ${key}`);
    return item.value;
  }

  /**
   * Delete a specific key from cache
   * @param {string} key - Cache key to delete
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * Check if a key exists in cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    console.log('Cache CLEARED: All entries removed');
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Estimate memory usage of cache
   * @returns {string} Memory usage estimate
   */
  getMemoryUsage() {
    const entries = Array.from(this.cache.entries());
    const sizeEstimate = JSON.stringify(entries).length * 2; // Rough estimate
    return `${(sizeEstimate / 1024).toFixed(2)} KB`;
  }

  /**
   * Invalidate cache entries by pattern
   * @param {string|RegExp} pattern - Pattern to match keys
   */
  invalidateByPattern(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
    console.log(`Cache INVALIDATE: ${keysToDelete.length} entries matching pattern '${pattern}'`);
    
    return keysToDelete.length;
  }

  /**
   * Invalidate cache entries by tags
   * @param {string[]} tags - Tags to invalidate
   */
  invalidateByTags(tags) {
    const keysToDelete = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (item.value && item.value._cacheTags) {
        const hasMatchingTag = tags.some(tag => item.value._cacheTags.includes(tag));
        if (hasMatchingTag) {
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach(key => this.delete(key));
    console.log(`Cache INVALIDATE: ${keysToDelete.length} entries with tags [${tags.join(', ')}]`);
    
    return keysToDelete.length;
  }

  /**
   * Set cache with tags for easier invalidation
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {string[]} tags - Tags for cache invalidation
   * @param {number} ttl - Time to live in milliseconds
   */
  setWithTags(key, value, tags = [], ttl = this.defaultTTL) {
    const taggedValue = {
      ...value,
      _cacheTags: tags
    };
    this.set(key, taggedValue, ttl);
  }

  /**
   * Clean up expired entries manually
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
    console.log(`Cache CLEANUP: Removed ${expiredKeys.length} expired entries`);
    
    return expiredKeys.length;
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);

module.exports = cacheService;