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
  private verbose: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.verbose = options.verbose ?? false;
  }

  debug(message: string, data?: unknown): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(pc.gray(`[DEBUG] ${message}`), data ?? '');
    }
  }

  info(message: string, data?: unknown): void {
    if (this.level <= LogLevel.INFO) {
      console.log(pc.blue(`[INFO] ${message}`), data ?? '');
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.level <= LogLevel.WARN) {
      console.log(pc.yellow(`[WARN] ${message}`), data ?? '');
    }
  }

  error(message: string, error?: Error | string): void {
    console.error(pc.red(`[ERROR] ${message}`), error ?? '');
  }

  success(message: string): void {
    console.log(pc.green(`[SUCCESS] ${message}`));
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }
}

// Create default logger instance
export const defaultLogger = new Logger({
  level: process.env.DEBUG ? LogLevel.DEBUG : LogLevel.INFO,
  verbose: process.env.VERBOSE === 'true'
});
