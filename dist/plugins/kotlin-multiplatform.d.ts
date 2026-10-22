/**
 * Kotlin Multiplatform (KMP) Plugin for andrud
 * Enables cross-platform project scaffolding targeting Android, iOS, Desktop (JVM), and Web (Kotlin/Wasm).
 */
import { type GeneratorOptions } from '../core/generator.js';
import { getKmpDirectories, generateKmpFiles, generateKmpSharedBuildGradle, generateKmpVersionCatalog } from '../templates/kmp.js';
import type { KmpPlatform, TemplateContext, GenerationResult, ProjectFeatures } from '../core/types.js';
export interface KmpPluginOptions {
    appName: string;
    packageName?: string;
    directory?: string;
    platforms?: KmpPlatform[] | string;
    minSdk?: number;
    targetSdk?: number;
    includeIosApp?: boolean;
    sharedModuleName?: string;
    features?: Partial<ProjectFeatures>;
    generatorOptions?: GeneratorOptions;
}
export interface AndrudPlugin {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly description: string;
    readonly gradlePlugins: ReadonlyArray<{
        id: string;
        version: string;
    }>;
    readonly supportedPlatforms: ReadonlyArray<KmpPlatform>;
    configureContext: (context: TemplateContext, platforms?: KmpPlatform[] | string) => TemplateContext;
    scaffold: (options: KmpPluginOptions) => Promise<GenerationResult>;
}
/**
 * Build a complete TemplateContext configured for Kotlin Multiplatform
 */
export declare function buildKmpProjectContext(options: KmpPluginOptions): TemplateContext;
/**
 * Create a cross-platform Kotlin Multiplatform project
 */
export declare function createKmpProject(options: KmpPluginOptions): Promise<GenerationResult>;
/**
 * Kotlin Multiplatform Plugin definition
 */
export declare const kotlinMultiplatformPlugin: AndrudPlugin;
export { getKmpDirectories, generateKmpFiles, generateKmpSharedBuildGradle, generateKmpVersionCatalog };
//# sourceMappingURL=kotlin-multiplatform.d.ts.map