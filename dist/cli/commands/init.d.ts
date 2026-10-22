/**
 * Init project command - initialize Android project in current directory
 */
interface InitCommandOptions {
    force?: boolean;
    template?: string;
    package?: string;
    packageName?: string;
    platforms?: string;
    yes?: boolean;
}
/**
 * Initialize Android project in current directory
 */
export declare function createInitCommand(options?: InitCommandOptions): Promise<void>;
export type { InitCommandOptions };
//# sourceMappingURL=init.d.ts.map