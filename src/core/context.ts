/**
 * Context builder for generating Android project context
 */

import { camelCase, kebabCase, pascalCase, snakeCase } from '../utils/validation.js';
import { GRADLE_VERSIONS, ANDROID_SDK_DEFAULTS, getTemplateConfig } from './config.js';
import type { TemplateType, TemplateContext, AndroidSdkConfig, GradleConfig, ProjectFeatures, NativeCppConfig } from './types.js';

const GENERATOR_VERSION = '1.0.0';

/**
 * Build default context from basic parameters
 */
export function buildDefaultProjectContext(
  appName: string,
  packageName: string,
  projectDirectory: string,
  template: TemplateType,
  features: Partial<ProjectFeatures> = {},
  minSdk?: number,
  targetSdk?: number
): Omit<TemplateContext, 'packagePath' | 'appNameSnake' | 'appNameKebab' | 'appNamePascal' | 'appNameCamel' | 'appNameLower' | 'year' | 'generatorVersion'> {
  // Determine language and UI framework from template
  const isCompose = template === 'kotlin-compose';
  const isNativeCpp = template === 'native-cpp';
  const isKotlin = template !== 'java-xml';
  const isXml = !isCompose;

  // Get template config for version info
  const templateConfig = getTemplateConfig(template);

  // Create Android SDK config
  const android: AndroidSdkConfig = {
    minSdk: minSdk ?? templateConfig.minSdk,
    targetSdk: targetSdk ?? templateConfig.targetSdk,
    compileSdk: templateConfig.compileSdk,
    buildToolsVersion: ANDROID_SDK_DEFAULTS.BUILD_TOOLS_VERSION
  };

  // Create Gradle config
  const gradle: GradleConfig = {
    agpVersion: templateConfig.agpVersion,
    gradleVersion: templateConfig.gradleVersion,
    kotlinVersion: isKotlin ? templateConfig.kotlinVersion : undefined,
    composeCompilerVersion: isCompose ? GRADLE_VERSIONS.COMPOSE_COMPILER : undefined,
    composeBomVersion: isCompose ? GRADLE_VERSIONS.COMPOSE_BOM : undefined
  };

  // Build project features
  const projectFeatures: ProjectFeatures = {
    git: features.git ?? true,
    readme: features.readme ?? true,
    androidX: features.androidX ?? true,
    kotlinDsl: features.kotlinDsl ?? true,
    adaptiveIcon: features.adaptiveIcon ?? true,
    material3: isCompose || (features.material3 ?? true),
    viewBinding: features.viewBinding ?? isXml,
    dataBinding: features.dataBinding ?? false,
    jetpackCompose: isCompose ? true : (features.jetpackCompose ?? false)
  };

  // Build native C++ config if needed
  const nativeCpp: NativeCppConfig | undefined = isNativeCpp ? {
    cppStandard: 'c++17',
    ndkVersion: templateConfig.ndkVersion ?? GRADLE_VERSIONS.NDK,
    stlType: 'c++_shared',
    abiFilters: ['armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64']
  } : undefined;

  // Build base context - spread features at top level to match TemplateContext (which extends ProjectFeatures)
  const baseContext = {
    appName,
    packageName,
    projectDirectory,
    template,
    language: templateConfig.language,
    uiFramework: templateConfig.uiFramework,
    android,
    gradle,
    ...projectFeatures,
    nativeCpp
  };

  // Cast to Omit<TemplateContext, ...> for the fields that buildTemplateContext adds
  const contextForBuildTemplate: Omit<TemplateContext, 'packagePath' | 'appNameSnake' | 'appNameKebab' | 'appNamePascal' | 'appNameCamel' | 'appNameLower' | 'year' | 'generatorVersion'> = baseContext as unknown as Omit<TemplateContext, 'packagePath' | 'appNameSnake' | 'appNameKebab' | 'appNamePascal' | 'appNameCamel' | 'appNameLower' | 'year' | 'generatorVersion'>;
  return contextForBuildTemplate;
}

/**
 * Build full template context with all derived values
 */
export function buildTemplateContext(
  context: {
    appName: string;
    packageName: string;
    projectDirectory: string;
    template: string;
    uiFramework: string;
    language: 'kotlin' | 'java';
    android: { minSdk: number; targetSdk: number; compileSdk: number };
    gradle: {
      agpVersion: string;
      gradleVersion: string;
      kotlinVersion?: string;
      composeCompilerVersion?: string;
      composeBomVersion?: string;
    };
    features: Record<string, boolean>;
    nativeCpp?: { cppStandard: string; ndkVersion?: string; stlType?: string; abiFilters?: string[] };
    year?: string;
  }
): TemplateContext {
  // Transform app name to various cases
  const normalizedAppName = context.appName.replace(/\s+/g, '_');
  const appNameSnake = snakeCase(context.appName);
  const appNameKebab = kebabCase(context.appName);
  const appNamePascal = pascalCase(context.appName);
  const appNameCamel = camelCase(context.appName);
  const appNameLower = context.appName.toLowerCase().replace(/\s+/g, '');

  // Convert package name to path format (e.g., "com.example.myapp" -> "com/example/myapp")
  const packagePath = context.packageName.replace(/\./g, '/');

  // Get current year
  const year = context.year ?? new Date().getFullYear().toString();

  // Build native C++ config
  const nativeCpp: NativeCppConfig | undefined = context.nativeCpp ? {
    cppStandard: (context.nativeCpp.cppStandard === 'c++20' ? 'c++20' : 'c++17') as 'c++17' | 'c++20',
    ndkVersion: context.nativeCpp.ndkVersion,
    stlType: (context.nativeCpp.stlType as NativeCppConfig['stlType']) ?? 'c++_shared',
    abiFilters: context.nativeCpp.abiFilters
  } : undefined;

  // Build project features from context (features may be at top level or nested)
  const featuresObj = context.features as Record<string, unknown> || {};
  const features: ProjectFeatures = {
    git: typeof featuresObj.git === 'boolean' ? featuresObj.git : true,
    readme: typeof featuresObj.readme === 'boolean' ? featuresObj.readme : true,
    androidX: typeof featuresObj.androidX === 'boolean' ? featuresObj.androidX : true,
    kotlinDsl: typeof featuresObj.kotlinDsl === 'boolean' ? featuresObj.kotlinDsl : true,
    adaptiveIcon: typeof featuresObj.adaptiveIcon === 'boolean' ? featuresObj.adaptiveIcon : true,
    material3: typeof featuresObj.material3 === 'boolean' ? featuresObj.material3 : true,
    viewBinding: typeof featuresObj.viewBinding === 'boolean' ? featuresObj.viewBinding : undefined,
    dataBinding: typeof featuresObj.dataBinding === 'boolean' ? featuresObj.dataBinding : undefined,
    jetpackCompose: typeof featuresObj.jetpackCompose === 'boolean' ? featuresObj.jetpackCompose : undefined
  };

  // Build the complete template context
  const templateContext: TemplateContext = {
    appName: context.appName,
    packageName: context.packageName,
    projectDirectory: context.projectDirectory,
    template: context.template as TemplateType,
    language: context.language,
    uiFramework: context.uiFramework as 'xml' | 'compose',
    android: {
      minSdk: context.android.minSdk,
      targetSdk: context.android.targetSdk,
      compileSdk: context.android.compileSdk,
      buildToolsVersion: context.android.compileSdk > 34 ? '35.0.0' : '34.0.0'
    },
    gradle: {
      agpVersion: context.gradle.agpVersion,
      gradleVersion: context.gradle.gradleVersion,
      kotlinVersion: context.gradle.kotlinVersion,
      composeCompilerVersion: context.gradle.composeCompilerVersion,
      composeBomVersion: context.gradle.composeBomVersion
    },
    appNameSnake,
    appNameKebab,
    appNamePascal,
    appNameCamel,
    appNameLower,
    packagePath,
    year,
    generatorVersion: GENERATOR_VERSION,
    ...features,
    nativeCpp
  };

  return templateContext;
}

/**
 * Validate context has all required fields
 */
export function validateContext(context: Partial<TemplateContext>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!context.appName) errors.push('appName is required');
  if (!context.packageName) errors.push('packageName is required');
  if (!context.projectDirectory) errors.push('projectDirectory is required');
  if (!context.template) errors.push('template is required');
  if (!context.language) errors.push('language is required');
  if (!context.uiFramework) errors.push('uiFramework is required');
  if (!context.android) errors.push('android config is required');
  if (!context.gradle) errors.push('gradle config is required');

  if (context.android) {
    if (!context.android.minSdk) errors.push('android.minSdk is required');
    if (!context.android.targetSdk) errors.push('android.targetSdk is required');
    if (!context.android.compileSdk) errors.push('android.compileSdk is required');
  }

  if (context.gradle) {
    if (!context.gradle.agpVersion) errors.push('gradle.agpVersion is required');
    if (!context.gradle.gradleVersion) errors.push('gradle.gradleVersion is required');
  }

  return { valid: errors.length === 0, errors };
}