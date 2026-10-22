/**
 * Logging utilities with structured logging levels
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export interface LoggerOptions {
    level?: LogLevel;
    verbose?: boolean;
}
export declare class Logger {
    private level;
    private verboseEnabled;
    constructor(options?: LoggerOptions);
    debug(message: string, data?: unknown): void;
    verbose(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, error?: Error | string): void;
    success(message: string): void;
    setLevel(level: LogLevel): void;
    setVerbose(verbose: boolean): void;
    isVerbose(): boolean;
}
export declare const defaultLogger: Logger;
//# sourceMappingURL=logger.d.ts.map