/**
 * Init project command - initialize Android project in current directory
 */
interface InitCommandOptions {
    force: boolean;
    template?: string;
}
/**
 * Initialize Android project in current directory
 */
export declare function createInitCommand(_options: InitCommandOptions, args?: {
    template?: string;
}): Promise<void>;
export {};
//# sourceMappingURL=init.d.ts.map