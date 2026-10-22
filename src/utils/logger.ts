/**
 * Logging utilities with structured logging levels
 */

import pc from 'picocolors';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LoggerOptions {
  level?: LogLevel;
  verbose?: boolean;
}

export class Logger {
  private level: LogLevel;
  private verboseEnabled: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.verboseEnabled = options.verbose ?? false;
  }

  debug(message: string, data?: unknown): void {
    if (this.level <= LogLevel.DEBUG || this.verboseEnabled) {
      if (data !== undefined) {
        console.log(pc.gray(`[DEBUG] ${message}`), data);
      } else {
        console.log(pc.gray(`[DEBUG] ${message}`));
      }
    }
  }

  verbose(message: string, data?: unknown): void {
    if (this.verboseEnabled || this.level <= LogLevel.DEBUG) {
      if (data !== undefined) {
        console.log(pc.gray(`[VERBOSE] ${message}`), data);
      } else {
        console.log(pc.gray(`[VERBOSE] ${message}`));
      }
    }
  }

  info(message: string, data?: unknown): void {
    if (this.level <= LogLevel.INFO) {
      if (data !== undefined) {
        console.log(pc.blue(`[INFO] ${message}`), data);
      } else {
        console.log(pc.blue(`[INFO] ${message}`));
      }
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.level <= LogLevel.WARN) {
      if (data !== undefined) {
        console.log(pc.yellow(`[WARN] ${message}`), data);
      } else {
        console.log(pc.yellow(`[WARN] ${message}`));
      }
    }
  }

  error(message: string, error?: Error | string): void {
    if (error !== undefined) {
      console.error(pc.red(`[ERROR] ${message}`), error);
    } else {
      console.error(pc.red(`[ERROR] ${message}`));
    }
  }

  success(message: string): void {
    console.log(pc.green(`[SUCCESS] ${message}`));
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setVerbose(verbose: boolean): void {
    this.verboseEnabled = verbose;
  }

  isVerbose(): boolean {
    return this.verboseEnabled;
  }
}

// Create default logger instance
export const defaultLogger = new Logger({
  level: process.env.DEBUG ? LogLevel.DEBUG : LogLevel.INFO,
  verbose: process.env.VERBOSE === 'true' || process.env.VERBOSE === '1'
});
