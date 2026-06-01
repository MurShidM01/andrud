/**
 * Object and array utilities
 */
// Object utilities
/**
 * Deep merge objects
 */
export function merge(target, ...sources) {
    for (const source of sources) {
        for (const key of Object.keys(source)) {
            const targetValue = target[key];
            const sourceValue = source[key];
            if (sourceValue &&
                typeof sourceValue === 'object' &&
                !Array.isArray(sourceValue) &&
                targetValue &&
                typeof targetValue === 'object' &&
                !Array.isArray(targetValue)) {
                target[key] = merge(targetValue, sourceValue);
            }
            else {
                target[key] = sourceValue;
            }
        }
    }
    return target;
}
/**
 * Omit keys from object
 */
export function omit(obj, keys) {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
}
/**
 * Pick keys from object
 */
export function pick(obj, keys) {
    const result = {};
    keys.forEach((key) => {
        result[key] = obj[key];
    });
    return result;
}
/**
 * Invert object keys and values
 */
export function invert(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[value.toString()] = key;
    }
    return result;
}
/**
 * Map values of object
 */
export function mapValues(obj, fn) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[key] = fn(value, key);
    }
    return result;
}
/**
 * Filter object keys
 */
export function filterKeys(obj, fn) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (fn(key)) {
            result[key] = value;
        }
    }
    return result;
}
// Array utilities
/**
 * Group array items by key
 */
export function groupBy(array, keyFn) {
    return array.reduce((result, item) => {
        const key = keyFn(item);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
        return result;
    }, {});
}
/**
 * Get unique values
 */
export function unique(array) {
    return Array.from(new Set(array));
}
/**
 * Get unique values by predicate
 */
export function uniqueBy(array, predicate) {
    const seen = new Set();
    return array.filter((item) => {
        const key = predicate(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
/**
 * Split array into chunks
 */
export function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
/**
 * Flatten array one level
 */
export function flatten(array) {
    const result = [];
    for (const item of array) {
        if (Array.isArray(item)) {
            result.push(...item);
        }
        else {
            result.push(item);
        }
    }
    return result;
}
/**
 * Deep flatten nested array
 */
export function flattenDeep(array) {
    return array.reduce((acc, item) => Array.isArray(item) ? acc.concat(flattenDeep(item)) : acc.concat(item), []);
}
/**
 * Get difference between arrays
 */
export function difference(a, b) {
    const bSet = new Set(b);
    return a.filter((item) => !bSet.has(item));
}
/**
 * Get intersection of arrays
 */
export function intersection(a, b) {
    const bSet = new Set(b);
    return a.filter((item) => bSet.has(item));
}
/**
 * Get union of arrays
 */
export function union(...arrays) {
    return unique(arrays.flat());
}
/**
 * Sort array by key
 */
export function sortBy(array, keyFn) {
    return [...array].sort((a, b) => {
        const aKey = keyFn(a);
        const bKey = keyFn(b);
        if (aKey < bKey)
            return -1;
        if (aKey > bKey)
            return 1;
        return 0;
    });
}
/**
 * Partition array by predicate
 */
export function partition(array, predicate) {
    const truthy = [];
    const falsy = [];
    array.forEach((item) => {
        if (predicate(item)) {
            truthy.push(item);
        }
        else {
            falsy.push(item);
        }
    });
    return [truthy, falsy];
}
/**
 * Remove falsy values from array
 */
export function compact(array) {
    return array.filter(Boolean);
}
/**
 * Zip arrays together
 */
export function zip(a, b) {
    const length = Math.min(a.length, b.length);
    const result = [];
    for (let i = 0; i < length; i++) {
        const aItem = a[i];
        const bItem = b[i];
        if (aItem !== undefined && bItem !== undefined) {
            result.push([aItem, bItem]);
        }
    }
    return result;
}
/**
 * Unzip zipped arrays
 */
export function unzip(zipped) {
    const a = [];
    const b = [];
    zipped.forEach(([first, second]) => {
        a.push(first);
        b.push(second);
    });
    return [a, b];
}
/**
 * Generate range of numbers
 */
export function range(start, end, step = 1) {
    if (end === undefined) {
        end = start;
        start = 0;
    }
    const result = [];
    for (let i = start; i < end; i += step) {
        result.push(i);
    }
    return result;
}
/**
 * Generate array of repeated values
 */
export function times(n, fn) {
    return Array.from({ length: n }, (_, i) => fn(i));
}
// Math utilities
/**
 * Clamp number between min and max
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
/**
 * Generate random integer between min and max
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Get random element from array
 */
export function randomElement(array) {
    if (array.length === 0)
        return undefined;
    return array[Math.floor(Math.random() * array.length)];
}
/**
 * Shuffle array in place
 */
export function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = result[i];
        const swap = result[j];
        if (temp !== undefined && swap !== undefined) {
            result[i] = swap;
            result[j] = temp;
        }
    }
    return result;
}
// Async utilities
/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Retry function on failure
 */
export async function retry(fn, options = {}) {
    const { retries = 3, delay = 1000, backoff = 2, onRetry } = options;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < retries) {
                if (onRetry) {
                    onRetry(lastError, attempt + 1);
                }
                await sleep(delay * Math.pow(backoff, attempt));
            }
        }
    }
    throw lastError;
}
// Function utilities
/**
 * Memoize function results
 */
export function memoize(fn) {
    const cache = new Map();
    const memoized = ((...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    });
    memoized.clear = () => cache.clear();
    return memoized;
}
// Deep utilities
/**
 * Deep clone an object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => deepClone(item));
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
        return new RegExp(obj.source, obj.flags);
    }
    const cloned = {};
    for (const key of Object.keys(obj)) {
        cloned[key] = deepClone(obj[key]);
    }
    return cloned;
}
/**
 * Deep equality check
 */
export function deepEqual(a, b) {
    if (a === b)
        return true;
    if (a === null || b === null)
        return false;
    if (typeof a !== 'object' || typeof b !== 'object')
        return false;
    if (Array.isArray(a) !== Array.isArray(b))
        return false;
    const aObj = a;
    const bObj = b;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length)
        return false;
    for (const key of aKeys) {
        if (!bKeys.includes(key))
            return false;
        if (!deepEqual(aObj[key], bObj[key]))
            return false;
    }
    return true;
}
/**
 * Deep merge objects
 */
export function deepMerge(target, ...sources) {
    return merge(target, ...sources);
}
//# sourceMappingURL=object.js.map