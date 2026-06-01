/**
 * Project generator - creates Android project structure and files
 */
import type { TemplateContext, GenerationResult } from './types.js';
export interface GeneratorOptions {
    overwrite?: boolean;
    skipInstall?: boolean;
    dryRun?: boolean;
    verbose?: boolean;
}
/**
 * Validate project directory can be used
 */
export declare function validateProjectDirectory(projectPath: string, options?: {
    overwrite: boolean;
}): Promise<{
    valid: boolean;
    error?: string;
    existingFiles?: string[];
}>;
/**
 * Validate context has all required fields
 */
export declare function validateContext(context: Partial<TemplateContext>): {
    valid: boolean;
    errors: string[];
};
/**
 * Prepare project directory structure
 */
export declare function prepareProjectStructure(projectPath: string, context: TemplateContext): Promise<{
    success: boolean;
    createdPaths: string[];
    errors: string[];
}>;
/**
 * Generate all project files
 */
export declare function generateProject(context: TemplateContext, options?: GeneratorOptions): Promise<GenerationResult>;
/**
 * Get directory contents
 */
export declare function getDirectoryContents(path: string): Promise<string[]>;
//# sourceMappingURL=generator.d.ts.map