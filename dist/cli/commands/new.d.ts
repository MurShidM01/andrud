/**
 * New project creation command with interactive prompts
 */
interface NewCommandOptions {
    name?: string;
    template?: string;
    packageName?: string;
    directory?: string;
    minSdk?: number;
    targetSdk?: number;
    force?: boolean;
    skipInstall?: boolean;
    git?: boolean;
    kotlin?: boolean;
    verbose?: boolean;
}
/**
 * Create a new Android project
 */
export declare function createNewCommand(name?: string, options?: NewCommandOptions): Promise<void>;
export type { NewCommandOptions };
//# sourceMappingURL=new.d.ts.map