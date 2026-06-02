/**
 * Core type definitions for the Android project generator
 */

// Language and UI framework types
export type LanguageType = 'kotlin' | 'java';
export type UiFrameworkType = 'xml' | 'compose';
export type TemplateType = 'kotlin-xml' | 'kotlin-compose' | 'java-xml' | 'native-cpp';

// Android SDK configuration
export interface AndroidSdkConfig {
  minSdk: number;
  targetSdk: number;
  compileSdk: number;
  buildToolsVersion?: string;
}

// Gradle configuration
export interface GradleConfig {
  agpVersion: string;
  gradleVersion: string;
  kotlinVersion?: string;
  composeCompilerVersion?: string;
  composeBomVersion?: string;
}

// Project features
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

// Native C++ configuration
export interface NativeCppConfig {
  cppStandard: 'c++17' | 'c++20';
  ndkVersion?: string;
  stlType?: 'c++_shared' | 'c++_static' | 'none' | 'system';
  abiFilters?: string[];
}

// Template context for project generation
export interface TemplateContext extends ProjectFeatures {
  // Basic info
  appName: string;
  packageName: string;
  projectDirectory: string;
  template: TemplateType;

  // Derived info
  language: LanguageType;
  uiFramework: UiFrameworkType;

  // SDK and Gradle config
  android: AndroidSdkConfig;
  gradle: GradleConfig;

  // Transformed names
  appNameSnake: string;
  appNameKebab: string;
  appNamePascal: string;
  appNameCamel: string;
  appNameLower: string;

  // Package path (e.g., "com/example/myapp")
  packagePath: string;

  // Date and version info
  year: string;
  generatorVersion: string;

  // Native C++ config (optional)
  nativeCpp?: NativeCppConfig;
}

// Generation options
export interface GenerationOptions {
  overwrite: boolean;
  skipInstall: boolean;
  dryRun: boolean;
  verbose: boolean;
}

// Generation result
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

// File to be generated
export interface GeneratedFile {
  path: string;
  content: string | Uint8Array;
  overwrite?: boolean;
  executable?: boolean;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Directory structure definition
export interface DirectorySpec {
  path: string;
  description?: string;
}

// Template metadata
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

// CLI command options
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

// Default options
export const DEFAULT_GENERATION_OPTIONS: GenerationOptions = {
  overwrite: false,
  skipInstall: false,
  dryRun: false,
  verbose: false
};

export const DEFAULT_PROJECT_FEATURES: ProjectFeatures = {
  git: true,
  readme: true,
  androidX: true,
  kotlinDsl: true,
  adaptiveIcon: true,
  material3: true,
  viewBinding: true,
  dataBinding: false,
  jetpackCompose: false
};