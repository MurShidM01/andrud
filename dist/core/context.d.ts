/**
 * Context builder for generating Android project context
 */
import type { TemplateType, TemplateContext, ProjectFeatures } from './types.js';
/**
 * Build default context from basic parameters
 */
export declare function buildDefaultProjectContext(appName: string, packageName: string, projectDirectory: string, template: TemplateType, features?: Partial<ProjectFeatures>, minSdk?: number, targetSdk?: number): Omit<TemplateContext, 'packagePath' | 'appNameSnake' | 'appNameKebab' | 'appNamePascal' | 'appNameCamel' | 'appNameLower' | 'year' | 'generatorVersion'>;
/**
 * Build full template context with all derived values
 */
export declare function buildTemplateContext(context: {
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
    };
    gradle: {
        agpVersion: string;
        gradleVersion: string;
        kotlinVersion?: string;
        composeCompilerVersion?: string;
        composeBomVersion?: string;
    };
    features: Record<string, boolean>;
    nativeCpp?: {
        cppStandard: string;
        ndkVersion?: string;
        stlType?: string;
        abiFilters?: string[];
    };
    year?: string;
}): TemplateContext;
/**
 * Validate context has all required fields
 */
export declare function validateContext(context: Partial<TemplateContext>): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=context.d.ts.map