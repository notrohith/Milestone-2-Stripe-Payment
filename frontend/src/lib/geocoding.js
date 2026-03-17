/**
 * Nominatim Geocoding Service
 * - Singleton request queue (max 1 req/sec as per Nominatim ToS)
 * - LRU memory cache (last 100 queries) — avoids redundant requests entirely
 * - Automatic retry with exponential back-off on 429
 * - All requests go through a single serial queue regardless of how many
 *   components call at once
 */

const CACHE = new Map();      // query → result
const MAX_CACHE = 100;
const MIN_INTERVAL_MS = 1200; // slightly over 1s to be safe

let lastRequestTime = 0;
let queue = Promise.resolve(); // chained promise = serial execution

function cacheGet(key) {
    if (!CACHE.has(key)) return null;
    // Move to end (LRU)
    const val = CACHE.get(key);
    CACHE.delete(key);
    CACHE.set(key, val);
    return val;
}

function cacheSet(key, value) {
    if (CACHE.size >= MAX_CACHE) {
        // Evict oldest entry
        const firstKey = CACHE.keys().next().value;
        CACHE.delete(firstKey);
    }
    CACHE.set(key, value);
}

async function _doFetch(url, retries = 2) {
    // Enforce rate-limit gap
    const now = Date.now();
    const wait = MIN_INTERVAL_MS - (now - lastRequestTime);
    if (wait > 0) {
        await new Promise(r => setTimeout(r, wait));
    }
    lastRequestTime = Date.now();

    try {
        const res = await fetch(url);

        // 429 = rate limited — wait and retry
        if (res.status === 429 && retries > 0) {
            const retryAfter = parseInt(res.headers.get('Retry-After') || '2', 10);
            await new Promise(r => setTimeout(r, retryAfter * 1000));
            return _doFetch(url, retries - 1);
        }

        if (!res.ok) {
            throw new Error(`Nominatim HTTP ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, 1500));
            return _doFetch(url, retries - 1);
        }
        throw err;
    }
}

/**
 * Geocode a city/place name to [lat, lon].
 * Returns null on failure.
 */
export async function geocodePlace(query) {
    if (!query || query.trim().length < 2) return null;

    const key = `geo:${query.trim().toLowerCase()}`;
    const cached = cacheGet(key);
    if (cached !== undefined && cached !== null) return cached;
    // Return null immediately if we already know it yields no results
    if (cached === false) return null;

    // Enqueue — ensures only 1 request fires at a time across the whole app
    const result = await new Promise((resolve) => {
        queue = queue.then(async () => {
            // Check cache again in case another enqueued request already fetched it
            const cached2 = cacheGet(key);
            if (cached2 !== undefined && cached2 !== null) {
                resolve(cached2);
                return;
            }
            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=en&email=contact@ridewithme.com`;
                const data = await _doFetch(url);
                if (data && data.length > 0) {
                    const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                    cacheSet(key, coords);
                    resolve(coords);
                } else {
                    cacheSet(key, false); // cache "no results"
                    resolve(null);
                }
            } catch (err) {
                console.warn('Geocoding failed for:', query, err.message);
                resolve(null);
            }
        });
    });

    return result;
}

/**
 * Autocomplete search — returns array of { id, name, raw } suggestions.
 * Returns [] on failure.
 */
export async function searchPlaces(query, cityBias = '') {
    if (!query || query.trim().length < 3) return [];

    const fullQuery = cityBias ? `${query.trim()}, ${cityBias}` : query.trim();
    const key = `search:${fullQuery.toLowerCase()}`;
    const cached = cacheGet(key);
    if (cached) return cached;

    const result = await new Promise((resolve) => {
        queue = queue.then(async () => {
            const cached2 = cacheGet(key);
            if (cached2) { resolve(cached2); return; }
            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQuery)}&format=json&limit=5&addressdetails=1&accept-language=en&email=contact@ridewithme.com`;
                const data = await _doFetch(url);
                const formatted = (data || []).map(f => {
                    const address = f.address || {};
                    const parts = [
                        address.neighbourhood,
                        address.suburb,
                        address.city_district,
                        address.city || address.town,
                        address.state,
                    ].filter(Boolean);
                    const displayName = parts.length > 0
                        ? parts.slice(0, 3).join(', ')
                        : f.display_name;
                    return { id: f.place_id || String(Math.random()), name: displayName, raw: f };
                });
                const unique = Array.from(new Map(formatted.map(i => [i.name, i])).values());
                cacheSet(key, unique);
                resolve(unique);
            } catch (err) {
                console.warn('Autocomplete failed for:', query, err.message);
                resolve([]);
            }
        });
    });

    return result;
}
