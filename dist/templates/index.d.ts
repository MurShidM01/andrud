/**
 * Template registry, metadata, and file generator exports
 */
import type { TemplateType, TemplateMetadata } from '../core/types.js';
export type { TemplateMetadata };
export * from './gradle.js';
export * from './wrapper.js';
export * from './project-files.js';
export * from './manifest.js';
export * from './resources.js';
export * from './sources.js';
export * from './kmp.js';
export declare const TEMPLATE_REGISTRY: TemplateMetadata[];
/**
 * Get template metadata by ID (supports 'kmp' / 'cmp' aliases)
 */
export declare function getTemplateMetadata(id: TemplateType | string): TemplateMetadata | undefined;
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
export declare function getTemplatesByCategory(category: 'kotlin' | 'java' | 'native' | 'multiplatform'): TemplateMetadata[];
/**
 * Get template preview code
 */
export declare function getTemplatePreview(id: TemplateType | string): string | undefined;
//# sourceMappingURL=index.d.ts.map