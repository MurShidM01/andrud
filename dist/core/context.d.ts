/**
 * Context builder for generating Android and Kotlin Multiplatform project context
 */
import type { TemplateType, TemplateContext, ProjectFeatures, KmpConfig, KmpPlatform } from './types.js';
export type BaseProjectContext = Omit<TemplateContext, 'packagePath' | 'appNameSnake' | 'appNameKebab' | 'appNamePascal' | 'appNameCamel' | 'appNameLower' | 'year' | 'generatorVersion'> & {
    features: ProjectFeatures;
};
/**
 * Build default context from basic parameters
 */
export declare function buildDefaultProjectContext(appName: string, packageName: string, projectDirectory: string, template: TemplateType, features?: Partial<ProjectFeatures>, minSdk?: number, targetSdk?: number, kmpPlatforms?: KmpPlatform[] | string): BaseProjectContext;
export interface TemplateContextInput extends Partial<ProjectFeatures> {
    appName: string;
    packageName: string;
    projectDirectory: string;
    template: string;
    uiFramework: string;
    language: 'kotlin' | 'java';
    android: {
        minSdk: number;
        targetSdk: number;
        compileSdk: number;
        buildToolsVersion?: string;
    };
    gradle: {
        agpVersion: string;
        gradleVersion: string;
        kotlinVersion?: string;
        composeCompilerVersion?: string;
        composeBomVersion?: string;
        composeMultiplatformVersion?: string;
    };
    features?: Partial<ProjectFeatures> | Record<string, boolean | undefined>;
    nativeCpp?: {
        cppStandard: string;
        ndkVersion?: string;
        stlType?: string;
        abiFilters?: string[];
    };
    kmp?: Partial<KmpConfig>;
    year?: string;
}
/**
 * Build full template context with all derived values
 */
export declare function buildTemplateContext(context: TemplateContextInput): TemplateContext;
/**
 * Validate context has all required fields
 */
export declare function validateContext(context: Partial<TemplateContext>): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=context.d.ts.map