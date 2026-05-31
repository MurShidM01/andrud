/**
 * Spinner utilities using ora
 */

import ora, { type Ora } from 'ora';

export class AsyncSpinner {
  private spinner: Ora | null = null;
  private startTime: number = 0;

  start(text?: string): void {
    this.startTime = Date.now();
    this.spinner = ora({
      text: text ?? 'Loading...',
      spinner: 'dots'
    }).start();
  }

  update(text: string): void {
    if (this.spinner) {
      this.spinner.text = text;
    }
  }

  succeed(text?: string): void {
    if (this.spinner) {
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      this.spinner.succeed(text ? `${text} (${elapsed}s)` : undefined);
      this.spinner = null;
    }
  }

  fail(text?: string): void {
    if (this.spinner) {
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      this.spinner.fail(text ? `${text} (${elapsed}s)` : undefined);
      this.spinner = null;
    }
  }

  warn(text?: string): void {
    if (this.spinner) {
      this.spinner.warn(text);
    }
  }

  stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  isSpinning(): boolean {
    return this.spinner?.isSpinning ?? false;
  }
}

export interface WithSpinnerOptions {
  text?: string;
  successText?: string;
  failText?: string;
  warnText?: string;
}

/**
 * Executes an async function with a spinner
 */
export async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>,
  options?: WithSpinnerOptions
): Promise<T> {
  const spinner = new AsyncSpinner();
  spinner.start(text);

  try {
    const result = await fn();
    spinner.succeed(options?.successText);
    return result;
  } catch (error) {
    spinner.fail(options?.failText ?? (error instanceof Error ? error.message : 'An error occurred'));
    throw error;
  }
}

/**
 * Creates a simple loading indicator
 */
export function createSpinner(text?: string): Ora {
  return ora({
    text,
    spinner: 'dots'
  });
}