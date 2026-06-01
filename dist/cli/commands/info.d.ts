/**
 * Template info command - shows detailed information about templates
 */
interface InfoCommandOptions {
    template?: string;
    json: boolean;
}
/**
 * Show detailed info about a template
 */
export declare function createInfoCommand(template?: string, options?: InfoCommandOptions): Promise<void>;
export {};
//# sourceMappingURL=info.d.ts.map