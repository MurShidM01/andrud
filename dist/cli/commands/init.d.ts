/**
 * Init project command - initialize Android project in current directory
 */
interface InitCommandOptions {
    force?: boolean;
    template?: string;
    package?: string;
    packageName?: string;
    yes?: boolean;
}
/**
 * Initialize Android project in current directory
 */
export declare function createInitCommand(options?: InitCommandOptions): Promise<void>;
export {};
//# sourceMappingURL=init.d.ts.map