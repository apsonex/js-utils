class JsCache {
    _prefix = 'js_cache:';

    init({ prefix }) {
        this._prefix = prefix;
        return this;
    }

    /**
     * Convert human-readable TTL to seconds.
     * Accepts formats like "60s", "10m", "1hr", "1d", "1mo", "1yr".
     * @param {string|number|null} ttl
     * @returns {number|null}
     */
    _parseTTL(ttl) {
        if (ttl === null || typeof ttl === 'number') return ttl;

        const regex = /^(\d+)\s*(s|m|hr|d|mo|yr)$/i;
        const match = String(ttl).trim().match(regex);

        if (!match) return null;

        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'hr': return value * 60 * 60;
            case 'd': return value * 60 * 60 * 24;
            case 'mo': return value * 60 * 60 * 24 * 30;
            case 'yr': return value * 60 * 60 * 24 * 365;
            default: return null;
        }
    }

    _now() {
        return Math.floor(Date.now() / 1000);
    }

    _buildKey(key) {
        return `${this._prefix}${key}`;
    }

    /**
     * Store a value in cache.
     *
     * @param {string} key - Cache key.
     * @param {*} value - Value to store (string, object, number, etc.).
     * @param {string|number|null} ttl - Time to live (e.g. '60s', '10m', '1hr', null for forever).
     */
    put(key, value, ttl = null) {
        const ttlSeconds = this._parseTTL(ttl);
        const expiresAt = ttlSeconds ? this._now() + ttlSeconds : null;
        const payload = JSON.stringify({ value, expiresAt });
        localStorage.setItem(this._buildKey(key), payload);
    }

    /**
     * Retrieve a value from cache, or store and return it if it doesn't exist.
     *
     * @param {string} key - Cache key.
     * @param {string|number|null} ttl - TTL if storing the value (e.g. '10m').
     * @param {Function|*} callback - A function to call (or value to use) if not cached.
     * @returns {*} - The cached or computed value.
     */
    remember(key, ttl, callback) {
        if (this.has(key)) {
            return this.get(key);
        }

        const value = typeof callback === 'function' ? callback() : callback;
        this.put(key, value, ttl);
        return value;
    }

    /**
     * Determine if the given cache key exists and is not expired.
     *
     * @param {string} key - Cache key.
     * @returns {boolean}
     */
    has(key) {
        const item = localStorage.getItem(this._buildKey(key));
        if (!item) return false;

        try {
            const parsed = JSON.parse(item);
            if (parsed.expiresAt && parsed.expiresAt < this._now()) {
                this.forget(key);
                return false;
            }
            return true;
        } catch {
            this.forget(key);
            return false;
        }
    }

    /**
     * Retrieve the value of a given cache key.
     *
     * @param {string} key - Cache key.
     * @returns {*} - Cached value or null.
     */
    get(key) {
        if (!this.has(key)) return null;

        try {
            const item = JSON.parse(localStorage.getItem(this._buildKey(key)));
            return item.value;
        } catch {
            return null;
        }
    }

    /**
     * Remove the given cache key from storage.
     *
     * @param {string} key - Cache key.
     */
    forget(key) {
        localStorage.removeItem(this._buildKey(key));
    }
}

export {
    JsCache
}
