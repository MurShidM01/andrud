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
    verboseEnabled;
    constructor(options = {}) {
        this.level = options.level ?? LogLevel.INFO;
        this.verboseEnabled = options.verbose ?? false;
    }
    debug(message, data) {
        if (this.level <= LogLevel.DEBUG || this.verboseEnabled) {
            if (data !== undefined) {
                console.log(pc.gray(`[DEBUG] ${message}`), data);
            }
            else {
                console.log(pc.gray(`[DEBUG] ${message}`));
            }
        }
    }
    verbose(message, data) {
        if (this.verboseEnabled || this.level <= LogLevel.DEBUG) {
            if (data !== undefined) {
                console.log(pc.gray(`[VERBOSE] ${message}`), data);
            }
            else {
                console.log(pc.gray(`[VERBOSE] ${message}`));
            }
        }
    }
    info(message, data) {
        if (this.level <= LogLevel.INFO) {
            if (data !== undefined) {
                console.log(pc.blue(`[INFO] ${message}`), data);
            }
            else {
                console.log(pc.blue(`[INFO] ${message}`));
            }
        }
    }
    warn(message, data) {
        if (this.level <= LogLevel.WARN) {
            if (data !== undefined) {
                console.log(pc.yellow(`[WARN] ${message}`), data);
            }
            else {
                console.log(pc.yellow(`[WARN] ${message}`));
            }
        }
    }
    error(message, error) {
        if (error !== undefined) {
            console.error(pc.red(`[ERROR] ${message}`), error);
        }
        else {
            console.error(pc.red(`[ERROR] ${message}`));
        }
    }
    success(message) {
        console.log(pc.green(`[SUCCESS] ${message}`));
    }
    setLevel(level) {
        this.level = level;
    }
    setVerbose(verbose) {
        this.verboseEnabled = verbose;
    }
    isVerbose() {
        return this.verboseEnabled;
    }
}
// Create default logger instance
export const defaultLogger = new Logger({
    level: process.env.DEBUG ? LogLevel.DEBUG : LogLevel.INFO,
    verbose: process.env.VERBOSE === 'true' || process.env.VERBOSE === '1'
});
//# sourceMappingURL=logger.js.map