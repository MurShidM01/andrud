/**
 * List templates command - shows all available templates
 */
import type { TemplateMetadata } from '../../core/types.js';
interface ListCommandOptions {
    json: boolean;
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
export {};
//# sourceMappingURL=list.d.ts.map