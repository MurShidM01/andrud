/**
 * Spinner utilities using ora
 */
import ora from 'ora';
export class AsyncSpinner {
    spinner = null;
    startTime = 0;
    start(text) {
        this.startTime = Date.now();
        this.spinner = ora({
            text: text ?? 'Loading...',
            spinner: 'dots'
        }).start();
    }
    update(text) {
        if (this.spinner) {
            this.spinner.text = text;
        }
    }
    succeed(text) {
        if (this.spinner) {
            const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
            this.spinner.succeed(text ? `${text} (${elapsed}s)` : undefined);
            this.spinner = null;
        }
    }
    fail(text) {
        if (this.spinner) {
            const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
            this.spinner.fail(text ? `${text} (${elapsed}s)` : undefined);
            this.spinner = null;
        }
    }
    warn(text) {
        if (this.spinner) {
            this.spinner.warn(text);
        }
    }
    stop() {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    }
    isSpinning() {
        return this.spinner?.isSpinning ?? false;
    }
}
/**
 * Executes an async function with a spinner
 */
export async function withSpinner(text, fn, options) {
    const spinner = new AsyncSpinner();
    spinner.start(text);
    try {
        const result = await fn();
        spinner.succeed(options?.successText);
        return result;
    }
    catch (error) {
        spinner.fail(options?.failText ?? (error instanceof Error ? error.message : 'An error occurred'));
        throw error;
    }
}
/**
 * Creates a simple loading indicator
 */
export function createSpinner(text) {
    return ora({
        text,
        spinner: 'dots'
    });
}
//# sourceMappingURL=spinners.js.map