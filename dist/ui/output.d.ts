/**
 * Output formatting utilities
 */
import type { StyleType } from './types.js';
export interface OutputLogger {
    log: (message: string, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    success: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
    debug: (message: string, ...args: unknown[]) => void;
    verbose: (message: string, ...args: unknown[]) => void;
}
export type Logger = OutputLogger;
declare const logger: OutputLogger;
export { logger };
/**
 * Prints the welcome banner
 */
export declare function printWelcome(): void;
/**
 * Prints the goodbye message
 */
export declare function printGoodbye(isSuccess?: boolean): void;
/**
 * Prints a success message
 */
export declare function printSuccess(message: string, details?: string): void;
/**
 * Prints an error message
 */
export declare function printError(message: string, details?: string): void;
/**
 * Prints a section header
 */
export declare function printSection(text: string): void;
/**
 * Prints key-value pairs
 */
export declare function printKeyValue(items: Array<{
    key: string;
    value: string;
}>): void;
/**
 * Prints a separator line
 */
export declare function printSeparatorLine(char?: string, length?: number): void;
/**
 * Prints a banner with text
 */
export declare function printBanner(text: string, color?: StyleType): void;
/**
 * Prints an ASCII box with content
 */
export declare function printAsciiBox(lines: string[], options?: {
    border?: string;
    padding?: number;
}): void;
/**
 * Prints a table with columns
 */
export declare function printTable<T>(columns: Array<{
    header: string;
    accessor: (row: T) => string;
    width?: number;
}>, rows: T[]): void;
/**
 * Prints numbered steps
 */
export declare function printSteps(steps: string[]): void;
//# sourceMappingURL=output.d.ts.map