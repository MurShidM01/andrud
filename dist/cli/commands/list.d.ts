/**
 * List templates command - shows all available templates
 */
import type { TemplateMetadata } from '../../core/types.js';
export interface ListCommandOptions {
    json?: boolean;
    search?: string;
}
/**
 * List all available templates
 */
export declare function createListCommand(options?: ListCommandOptions): Promise<void>;
/**
 * Print templates as a compact list
 */
export declare function printTemplateList(templates: TemplateMetadata[]): void;
//# sourceMappingURL=list.d.ts.map