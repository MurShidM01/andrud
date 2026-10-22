/**
 * Clean, minimal Vite-style project creation command
 */
export interface CreateCommandOptions {
    name?: string;
    template?: string;
    package?: string;
    packageName?: string;
    directory?: string;
    platforms?: string;
    force?: boolean;
    yes?: boolean;
}
/**
 * Create a new Android project with clean minimal UI
 */
export declare function createCommand(nameOrOptions?: string | CreateCommandOptions, maybeOptions?: CreateCommandOptions): Promise<void>;
//# sourceMappingURL=create.d.ts.map