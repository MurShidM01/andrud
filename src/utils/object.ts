/**
 * Object and array utilities
 */

// Object utilities

/**
 * Deep merge objects
 */
export function merge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  for (const source of sources) {
    for (const key of Object.keys(source) as Array<keyof T>) {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        (target as Record<string, unknown>)[key as string] = merge(
          targetValue as object,
          sourceValue as object
        );
      } else {
        (target as Record<string, unknown>)[key as string] = sourceValue as unknown;
      }
    }
  }
  return target;
}

/**
 * Omit keys from object
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

/**
 * Pick keys from object
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}

/**
 * Invert object keys and values
 */
export function invert<T extends Record<string, string | number>>(obj: T): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[value.toString()] = key;
  }
  return result;
}

/**
 * Map values of object
 */
export function mapValues<T extends object, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> {
  const result = {} as Record<keyof T, U>;
  for (const [key, value] of Object.entries(obj)) {
    result[key as keyof T] = fn(value as T[keyof T], key as keyof T);
  }
  return result;
}

/**
 * Filter object keys
 */
export function filterKeys<T extends object>(
  obj: T,
  fn: (key: keyof T) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (fn(key as keyof T)) {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
}

// Array utilities

/**
 * Group array items by key
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

/**
 * Get unique values
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Get unique values by predicate
 */
export function uniqueBy<T>(array: T[], predicate: (item: T) => unknown): T[] {
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
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten array one level
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * Deep flatten nested array
 */
export function flattenDeep<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((acc, item) =>
    Array.isArray(item) ? acc.concat(flattenDeep(item)) : acc.concat(item), []);
}

/**
 * Get difference between arrays
 */
export function difference<T>(a: T[], b: T[]): T[] {
  const bSet = new Set(b);
  return a.filter((item) => !bSet.has(item));
}

/**
 * Get intersection of arrays
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const bSet = new Set(b);
  return a.filter((item) => bSet.has(item));
}

/**
 * Get union of arrays
 */
export function union<T>(...arrays: T[][]): T[] {
  return unique(arrays.flat());
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], keyFn: (item: T) => unknown | unknown[]): T[] {
  return [...array].sort((a, b) => {
    const aKey = keyFn(a);
    const bKey = keyFn(b);
    if ((aKey as string) < (bKey as string)) return -1;
    if ((aKey as string) > (bKey as string)) return 1;
    return 0;
  });
}

/**
 * Partition array by predicate
 */
export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  array.forEach((item) => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });
  return [truthy, falsy];
}

/**
 * Remove falsy values from array
 */
export function compact<T>(array: (T | null | undefined | false | '' | 0)[]): T[] {
  return array.filter(Boolean) as T[];
}

/**
 * Zip arrays together
 */
export function zip<T, U>(a: T[], b: U[]): Array<[T, U]> {
  const length = Math.min(a.length, b.length);
  const result: Array<[T, U]> = [];
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
export function unzip<T, U>(zipped: Array<[T, U]>): [T[], U[]] {
  const a: T[] = [];
  const b: U[] = [];
  zipped.forEach(([first, second]) => {
    a.push(first);
    b.push(second);
  });
  return [a, b];
}

/**
 * Generate range of numbers
 */
export function range(start: number, end?: number, step: number = 1): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Generate array of repeated values
 */
export function times<T>(n: number, fn: (index: number) => T): T[] {
  return Array.from({ length: n }, (_, i) => fn(i));
}

// Math utilities

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate random integer between min and max
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random element from array
 */
export function randomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)] as T;
}

/**
 * Shuffle array in place
 */
export function shuffle<T>(array: T[]): T[] {
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
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
  retries?: number;
  delay?: number;
  backoff?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Retry function on failure
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        if (onRetry) {
          onRetry(lastError, attempt + 1);
        }
        await sleep(delay * Math.pow(backoff, attempt));
      }
    }
  }

  throw lastError!;
}

// Function utilities

/**
 * Memoize function results
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T
): T & { clear: () => void } {
  const cache = new Map<string, unknown>();
  const memoized = ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T & { clear: () => void };

  memoized.clear = () => cache.clear();
  return memoized;
}

// Deep utilities

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as unknown as T;
  }

  const cloned = {} as T;
  for (const key of Object.keys(obj) as Array<keyof T>) {
    cloned[key] = deepClone(obj[key]);
  }
  return cloned;
}

/**
 * Deep equality check
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;

  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false;
    if (!deepEqual(aObj[key], bObj[key])) return false;
  }

  return true;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  return merge(target, ...sources);
}