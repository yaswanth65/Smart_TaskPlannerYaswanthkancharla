/**
 * Simple in-memory LRU cache for AI responses
 * Prevents duplicate API calls for identical prompts
 */

class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  _generateKey(goal) {
    // Normalize the goal text for cache key
    return goal.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  get(goal) {
    const key = this._generateKey(goal);
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      this.stats.hits++;
      return value;
    }
    this.stats.misses++;
    return null;
  }

  set(goal, value, ttl = 3600000) { // Default 1 hour TTL
    const key = this._generateKey(goal);
    
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.stats.evictions++;
    }

    // Store with timestamp for TTL
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    });
  }

  has(goal) {
    const key = this._generateKey(goal);
    if (!this.cache.has(key)) return false;

    const entry = this.cache.get(key);
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  clear() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%'
    };
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
const planCache = new LRUCache(50); // Cache up to 50 plans

// Cleanup expired entries every 10 minutes
setInterval(() => {
  planCache.cleanup();
}, 10 * 60 * 1000);

module.exports = planCache;
