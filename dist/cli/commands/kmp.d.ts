/**
 * Kotlin Multiplatform (KMP) CLI command
 * Scaffolds a cross-platform Kotlin Multiplatform & Compose Multiplatform project
 */
export interface KmpCommandOptions {
    package?: string;
    packageName?: string;
    directory?: string;
    platforms?: string;
    minSdk?: number | string;
    targetSdk?: number | string;
    force?: boolean;
    yes?: boolean;
}
/**
 * Create a new cross-platform Kotlin Multiplatform project
 */
export declare function createKmpCommand(name?: string, options?: KmpCommandOptions): Promise<void>;
//# sourceMappingURL=kmp.d.ts.map