
class CacheService {
    constructor() {
        this.cache = {};
        this.ttl = 60000;
    }

    set(key, value, customTTL = null) {
        const expiry = Date.now() + (customTTL || this.ttl);
        this.cache[key] = {
            value,
            expiry
        };
    }

    get(key) {
        const entry = this.cache[key];
        if (!entry) {
            return null;
        }

        if (entry.expiry < Date.now()) {
            delete this.cache[key];
            return null;
        }

        return entry.value;
    }

    delete(key) {
        delete this.cache[key];
    }


    clear() {
        this.cache = {};
    }
}

module.exports = new CacheService(); 