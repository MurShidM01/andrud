/**
 * Logging utilities with structured logging levels
 */
import pc from 'picocolors';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
export class Logger {
    level;
    verbose;
    constructor(options = {}) {
        this.level = options.level ?? LogLevel.INFO;
        this.verbose = options.verbose ?? false;
    }
    debug(message, data) {
        if (this.level <= LogLevel.DEBUG) {
            console.log(pc.gray(`[DEBUG] ${message}`), data ?? '');
        }
    }
    info(message, data) {
        if (this.level <= LogLevel.INFO) {
            console.log(pc.blue(`[INFO] ${message}`), data ?? '');
        }
    }
    warn(message, data) {
        if (this.level <= LogLevel.WARN) {
            console.log(pc.yellow(`[WARN] ${message}`), data ?? '');
        }
    }
    error(message, error) {
        console.error(pc.red(`[ERROR] ${message}`), error ?? '');
    }
    success(message) {
        console.log(pc.green(`[SUCCESS] ${message}`));
    }
    setLevel(level) {
        this.level = level;
    }
    setVerbose(verbose) {
        this.verbose = verbose;
    }
}
// Create default logger instance
export const defaultLogger = new Logger({
    level: process.env.DEBUG ? LogLevel.DEBUG : LogLevel.INFO,
    verbose: process.env.VERBOSE === 'true'
});
//# sourceMappingURL=logger.js.map