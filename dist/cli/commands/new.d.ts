/**
 * New project creation command with interactive prompts
 */
interface NewCommandOptions {
    name?: string;
    template?: string;
    package?: string;
    packageName?: string;
    directory?: string;
    minSdk?: number | string;
    targetSdk?: number | string;
    force?: boolean;
    skipInstall?: boolean;
    git?: boolean;
    readme?: boolean;
    kotlin?: boolean;
    verbose?: boolean;
    yes?: boolean;
}
/**
 * Create a new Android project
 */
export declare function createNewCommand(name?: string, options?: NewCommandOptions): Promise<void>;
export type { NewCommandOptions };
//# sourceMappingURL=new.d.ts.map