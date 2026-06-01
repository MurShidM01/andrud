/**
 * Spinner utilities using ora
 */
import { type Ora } from 'ora';
export declare class AsyncSpinner {
    private spinner;
    private startTime;
    start(text?: string): void;
    update(text: string): void;
    succeed(text?: string): void;
    fail(text?: string): void;
    warn(text?: string): void;
    stop(): void;
    isSpinning(): boolean;
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
export declare function withSpinner<T>(text: string, fn: () => Promise<T>, options?: WithSpinnerOptions): Promise<T>;
/**
 * Creates a simple loading indicator
 */
export declare function createSpinner(text?: string): Ora;
//# sourceMappingURL=spinners.d.ts.map