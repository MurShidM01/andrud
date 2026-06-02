/**
 * Core type definitions for the Android project generator
 */
export type LanguageType = 'kotlin' | 'java';
export type UiFrameworkType = 'xml' | 'compose';
export type TemplateType = 'kotlin-xml' | 'kotlin-compose' | 'java-xml' | 'native-cpp';
export interface AndroidSdkConfig {
    minSdk: number;
    targetSdk: number;
    compileSdk: number;
    buildToolsVersion?: string;
}
export interface GradleConfig {
    agpVersion: string;
    gradleVersion: string;
    kotlinVersion?: string;
    composeCompilerVersion?: string;
    composeBomVersion?: string;
}
export interface ProjectFeatures {
    git: boolean;
    readme: boolean;
    androidX: boolean;
    kotlinDsl: boolean;
    adaptiveIcon: boolean;
    material3: boolean;
    viewBinding?: boolean;
    dataBinding?: boolean;
    jetpackCompose?: boolean;
}
export interface NativeCppConfig {
    cppStandard: 'c++17' | 'c++20';
    ndkVersion?: string;
    stlType?: 'c++_shared' | 'c++_static' | 'none' | 'system';
    abiFilters?: string[];
}
export interface TemplateContext extends ProjectFeatures {
    appName: string;
    packageName: string;
    projectDirectory: string;
    template: TemplateType;
    language: LanguageType;
    uiFramework: UiFrameworkType;
    android: AndroidSdkConfig;
    gradle: GradleConfig;
    appNameSnake: string;
    appNameKebab: string;
    appNamePascal: string;
    appNameCamel: string;
    appNameLower: string;
    packagePath: string;
    year: string;
    generatorVersion: string;
    nativeCpp?: NativeCppConfig;
}
export interface GenerationOptions {
    overwrite: boolean;
    skipInstall: boolean;
    dryRun: boolean;
    verbose: boolean;
}
export interface GenerationResult {
    success: boolean;
    projectPath: string;
    generatedFiles: string[];
    skippedFiles: string[];
    errors: Array<{
        file?: string;
        message: string;
        code?: string;
    }>;
    warnings: string[];
    duration: number;
}
export interface GeneratedFile {
    path: string;
    content: string | Uint8Array;
    overwrite?: boolean;
    executable?: boolean;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface DirectorySpec {
    path: string;
    description?: string;
}
export interface TemplateMetadata {
    id: TemplateType;
    name: string;
    description: string;
    keywords: string[];
    features: string[];
    language: LanguageType;
    uiFramework: UiFrameworkType;
    codePreview?: string;
}
export interface NewCommandOptions {
    name?: string;
    template?: string;
    packageName?: string;
    directory?: string;
    minSdk?: number;
    targetSdk?: number;
    force?: boolean;
    skipInstall?: boolean;
    git?: boolean;
    kotlin?: boolean;
    verbose?: boolean;
}
export interface InitCommandOptions {
    force: boolean;
    template?: string;
}
export interface InfoCommandOptions {
    template?: string;
    json: boolean;
}
export interface ListCommandOptions {
    json: boolean;
}
export declare const DEFAULT_GENERATION_OPTIONS: GenerationOptions;
export declare const DEFAULT_PROJECT_FEATURES: ProjectFeatures;
//# sourceMappingURL=types.d.ts.map