import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JsCache } from '../src/js-cache';

describe('JsCache', () => {
  let cache;

  beforeEach(() => {
    localStorage.clear();
    cache = new JsCache().init({ prefix: 'test:' });
  });

  describe('_parseTTL', () => {
    it('should parse numeric ttl directly', () => {
      expect(cache._parseTTL(300)).toBe(300);
    });

    it('should parse TTL string formats', () => {
      expect(cache._parseTTL('60s')).toBe(60);
      expect(cache._parseTTL('10m')).toBe(600);
      expect(cache._parseTTL('1hr')).toBe(3600);
      expect(cache._parseTTL('2d')).toBe(172800);
      expect(cache._parseTTL('1mo')).toBe(2592000);
      expect(cache._parseTTL('1yr')).toBe(31536000);
    });

    it('should return null for invalid TTL strings', () => {
      expect(cache._parseTTL('abc')).toBeNull();
      expect(cache._parseTTL('123x')).toBeNull();
    });
  });

  describe('put / get', () => {
    it('should store and retrieve value', () => {
      cache.put('foo', 'bar', '60s');
      expect(cache.get('foo')).toBe('bar');
    });

    it('should store objects and retrieve them correctly', () => {
      const obj = { a: 1, b: 2 };
      cache.put('obj', obj, '10m');
      expect(cache.get('obj')).toEqual(obj);
    });
  });

  describe('has', () => {
    it('should return true for existing unexpired keys', () => {
      cache.put('exists', 'yes', '60s');
      expect(cache.has('exists')).toBe(true);
    });

    it('should return false for expired keys', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = JSON.stringify({ value: 'expired', expiresAt: now - 10 });
      localStorage.setItem('test:expiredKey', payload);

      expect(cache.has('expiredKey')).toBe(false);
      expect(localStorage.getItem('test:expiredKey')).toBeNull(); // auto-forget
    });

    it('should return false for corrupt JSON and remove it', () => {
      localStorage.setItem('test:badKey', '{notjson}');
      expect(cache.has('badKey')).toBe(false);
      expect(localStorage.getItem('test:badKey')).toBeNull();
    });
  });

  describe('remember', () => {
    it('should return cached value if exists', () => {
      cache.put('abc', 'cached', '1m');
      const result = cache.remember('abc', '10s', () => 'new');
      expect(result).toBe('cached');
    });

    it('should compute and store new value if not cached', () => {
      const result = cache.remember('newKey', '10s', () => 'computed');
      expect(result).toBe('computed');
      expect(cache.get('newKey')).toBe('computed');
    });

    it('should accept direct value instead of function', () => {
      const result = cache.remember('valueKey', '1hr', 123);
      expect(result).toBe(123);
      expect(cache.get('valueKey')).toBe(123);
    });
  });

  describe('forget', () => {
    it('should remove a key from localStorage', () => {
      cache.put('temp', 'value', '1m');
      expect(cache.get('temp')).toBe('value');
      cache.forget('temp');
      expect(cache.get('temp')).toBeNull();
    });
  });

  describe('_buildKey', () => {
    it('should apply prefix to keys', () => {
      expect(cache._buildKey('foo')).toBe('test:foo');
    });
  });
});
