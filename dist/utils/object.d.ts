/**
 * Object and array utilities
 */
/**
 * Deep merge objects
 */
export declare function merge<T extends object>(target: T, ...sources: Partial<T>[]): T;
/**
 * Omit keys from object
 */
export declare function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
/**
 * Pick keys from object
 */
export declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * Invert object keys and values
 */
export declare function invert<T extends Record<string, string | number>>(obj: T): Record<string, string>;
/**
 * Map values of object
 */
export declare function mapValues<T extends object, U>(obj: T, fn: (value: T[keyof T], key: keyof T) => U): Record<keyof T, U>;
/**
 * Filter object keys
 */
export declare function filterKeys<T extends object>(obj: T, fn: (key: keyof T) => boolean): Partial<T>;
/**
 * Group array items by key
 */
export declare function groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]>;
/**
 * Get unique values
 */
export declare function unique<T>(array: T[]): T[];
/**
 * Get unique values by predicate
 */
export declare function uniqueBy<T>(array: T[], predicate: (item: T) => unknown): T[];
/**
 * Split array into chunks
 */
export declare function chunk<T>(array: T[], size: number): T[][];
/**
 * Flatten array one level
 */
export declare function flatten<T>(array: (T | T[])[]): T[];
/**
 * Deep flatten nested array
 */
export declare function flattenDeep<T>(array: (T | T[])[]): T[];
/**
 * Get difference between arrays
 */
export declare function difference<T>(a: T[], b: T[]): T[];
/**
 * Get intersection of arrays
 */
export declare function intersection<T>(a: T[], b: T[]): T[];
/**
 * Get union of arrays
 */
export declare function union<T>(...arrays: T[][]): T[];
/**
 * Sort array by key
 */
export declare function sortBy<T>(array: T[], keyFn: (item: T) => unknown | unknown[]): T[];
/**
 * Partition array by predicate
 */
export declare function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]];
/**
 * Remove falsy values from array
 */
export declare function compact<T>(array: (T | null | undefined | false | '' | 0)[]): T[];
/**
 * Zip arrays together
 */
export declare function zip<T, U>(a: T[], b: U[]): Array<[T, U]>;
/**
 * Unzip zipped arrays
 */
export declare function unzip<T, U>(zipped: Array<[T, U]>): [T[], U[]];
/**
 * Generate range of numbers
 */
export declare function range(start: number, end?: number, step?: number): number[];
/**
 * Generate array of repeated values
 */
export declare function times<T>(n: number, fn: (index: number) => T): T[];
/**
 * Clamp number between min and max
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Generate random integer between min and max
 */
export declare function randomInt(min: number, max: number): number;
/**
 * Get random element from array
 */
export declare function randomElement<T>(array: T[]): T | undefined;
/**
 * Shuffle array in place
 */
export declare function shuffle<T>(array: T[]): T[];
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
export interface RetryOptions {
    retries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (error: Error, attempt: number) => void;
}
/**
 * Retry function on failure
 */
export declare function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
/**
 * Memoize function results
 */
export declare function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T & {
    clear: () => void;
};
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Deep equality check
 */
export declare function deepEqual(a: unknown, b: unknown): boolean;
/**
 * Deep merge objects
 */
export declare function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T;
//# sourceMappingURL=object.d.ts.map