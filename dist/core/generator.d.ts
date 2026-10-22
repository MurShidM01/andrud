/**
 * Project generator - orchestrates Android project directory structure and file creation
 */
import type { TemplateContext, GenerationResult, GeneratedFile } from './types.js';
import { validateContext } from './context.js';
export { validateContext };
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
 * Prepare project directory structure
 */
export declare function prepareProjectStructure(projectPath: string, context: TemplateContext): Promise<{
    success: boolean;
    createdPaths: string[];
    errors: string[];
}>;
/**
 * Assemble the complete list of files to generate for a given template context
 */
export declare function collectProjectFiles(context: TemplateContext): GeneratedFile[];
/**
 * Generate all project files
 */
export declare function generateProject(context: TemplateContext, options?: GeneratorOptions): Promise<GenerationResult>;
/**
 * Get directory contents
 */
export declare function getDirectoryContents(path: string): Promise<string[]>;
//# sourceMappingURL=generator.d.ts.map