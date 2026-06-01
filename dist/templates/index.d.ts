/**
 * Template registry and metadata
 */
import type { TemplateType } from '../core/types.js';
interface TemplateMetadata {
    id: TemplateType;
    name: string;
    description: string;
    keywords: string[];
    features: string[];
    language: 'kotlin' | 'java';
    uiFramework: 'xml' | 'compose';
}
export type { TemplateMetadata };
export declare const TEMPLATE_REGISTRY: TemplateMetadata[];
/**
 * Get template metadata by ID
 */
export declare function getTemplateMetadata(id: TemplateType): TemplateMetadata | undefined;
/**
 * Get all available templates
 */
export declare function getAllTemplates(): TemplateMetadata[];
/**
 * Search templates by query
 */
export declare function searchTemplates(query: string): TemplateMetadata[];
/**
 * Get templates by category
 */
export declare function getTemplatesByCategory(category: 'kotlin' | 'java' | 'native'): TemplateMetadata[];
/**
 * Get template preview code
 */
export declare function getTemplatePreview(id: TemplateType): string | undefined;
//# sourceMappingURL=index.d.ts.map