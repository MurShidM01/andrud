/**
 * Gradle build script, settings, properties, and ProGuard file generators
 */
import type { TemplateContext, GeneratedFile } from '../core/types.js';
export declare function generateSettingsGradle(ctx: TemplateContext): GeneratedFile;
export declare function generateRootBuildGradle(ctx: TemplateContext): GeneratedFile;
export declare function generateGradleProperties(ctx: TemplateContext): GeneratedFile;
export declare function generateAppBuildGradle(ctx: TemplateContext): GeneratedFile;
export declare function generateAppProguardRules(_ctx: TemplateContext): GeneratedFile;
//# sourceMappingURL=gradle.d.ts.map