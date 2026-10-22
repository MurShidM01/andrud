/**
 * Kotlin Multiplatform (KMP) Plugin for andrud
 * Enables cross-platform project scaffolding targeting Android, iOS, Desktop (JVM), and Web (Kotlin/Wasm).
 */

import { buildDefaultProjectContext, buildTemplateContext } from '../core/context.js';
import { generateProject, type GeneratorOptions } from '../core/generator.js';
import {
  GRADLE_VERSIONS,
  DEFAULT_KMP_PLATFORMS,
  parseKmpPlatforms
} from '../core/config.js';
import { resolveProjectDirectory } from '../utils/filesystem.js';
import {
  deriveDefaultPackageName,
  validateAppName,
  validatePackageNameInput,
  validateDirectoryPath
} from '../utils/validation.js';
import {
  getKmpDirectories,
  generateKmpFiles,
  generateKmpSharedBuildGradle,
  generateKmpVersionCatalog
} from '../templates/kmp.js';
import type {
  KmpPlatform,
  KmpConfig,
  TemplateContext,
  GenerationResult,
  ProjectFeatures
} from '../core/types.js';

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
  readonly gradlePlugins: ReadonlyArray<{ id: string; version: string }>;
  readonly supportedPlatforms: ReadonlyArray<KmpPlatform>;
  configureContext: (
    context: TemplateContext,
    platforms?: KmpPlatform[] | string
  ) => TemplateContext;
  scaffold: (options: KmpPluginOptions) => Promise<GenerationResult>;
}

/**
 * Build a complete TemplateContext configured for Kotlin Multiplatform
 */
export function buildKmpProjectContext(options: KmpPluginOptions): TemplateContext {
  const appValidation = validateAppName(options.appName);
  if (!appValidation.valid) {
    throw new Error(`Invalid app name: ${appValidation.errors.join(', ')}`);
  }
  const appName = appValidation.normalized ?? options.appName;

  const packageName = options.packageName
    ? options.packageName.trim().toLowerCase()
    : deriveDefaultPackageName(appName);

  const pkgValidation = validatePackageNameInput(packageName);
  if (!pkgValidation.valid) {
    throw new Error(`Invalid package name: ${pkgValidation.errors.join(', ')}`);
  }

  const baseDir = options.directory ?? './';
  const dirValidation = validateDirectoryPath(baseDir);
  if (!dirValidation.valid) {
    throw new Error(`Invalid directory: ${dirValidation.errors.join(', ')}`);
  }

  const projectDirectory = resolveProjectDirectory(
    dirValidation.normalized ?? baseDir,
    appName
  );
  const platforms = parseKmpPlatforms(options.platforms);

  const baseContext = buildDefaultProjectContext(
    appName,
    packageName,
    projectDirectory,
    'kotlin-multiplatform',
    options.features,
    options.minSdk,
    options.targetSdk,
    platforms
  );

  const kmpOverride: Partial<KmpConfig> = {
    platforms,
    includeIosApp: options.includeIosApp ?? platforms.includes('ios'),
    sharedModuleName: options.sharedModuleName ?? 'shared'
  };

  return buildTemplateContext({
    ...baseContext,
    kmp: {
      ...baseContext.kmp,
      ...kmpOverride
    }
  });
}

/**
 * Create a cross-platform Kotlin Multiplatform project
 */
export async function createKmpProject(options: KmpPluginOptions): Promise<GenerationResult> {
  const context = buildKmpProjectContext(options);
  return generateProject(context, options.generatorOptions);
}

/**
 * Kotlin Multiplatform Plugin definition
 */
export const kotlinMultiplatformPlugin: AndrudPlugin = {
  id: 'kotlin-multiplatform',
  name: 'Kotlin Multiplatform Plugin',
  version: GRADLE_VERSIONS.KOTLIN,
  description:
    'Builds cross-platform Kotlin Multiplatform & Compose Multiplatform projects for Android, iOS, Desktop (JVM), and Web (Kotlin/Wasm).',
  gradlePlugins: [
    { id: 'org.jetbrains.kotlin.multiplatform', version: GRADLE_VERSIONS.KOTLIN },
    { id: 'org.jetbrains.compose', version: GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM },
    { id: 'org.jetbrains.kotlin.plugin.compose', version: GRADLE_VERSIONS.KOTLIN },
    { id: 'org.jetbrains.kotlin.plugin.serialization', version: GRADLE_VERSIONS.KOTLIN },
    { id: 'com.android.application', version: GRADLE_VERSIONS.AGP },
    { id: 'com.android.library', version: GRADLE_VERSIONS.AGP }
  ],
  supportedPlatforms: [...DEFAULT_KMP_PLATFORMS],
  configureContext(context: TemplateContext, platforms?: KmpPlatform[] | string): TemplateContext {
    const resolvedPlatforms = parseKmpPlatforms(platforms ?? context.kmp?.platforms);
    return {
      ...context,
      template: 'kotlin-multiplatform',
      language: 'kotlin',
      uiFramework: 'compose',
      kotlinMultiplatform: true,
      gradle: {
        ...context.gradle,
        composeMultiplatformVersion: GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM
      },
      kmp: {
        platforms: resolvedPlatforms,
        composeMultiplatformVersion: GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM,
        coroutinesVersion: GRADLE_VERSIONS.KOTLINX_COROUTINES,
        serializationVersion: GRADLE_VERSIONS.KOTLINX_SERIALIZATION,
        sharedModuleName: context.kmp?.sharedModuleName ?? 'shared',
        includeIosApp: resolvedPlatforms.includes('ios')
      }
    };
  },
  scaffold: createKmpProject
};

export {
  getKmpDirectories,
  generateKmpFiles,
  generateKmpSharedBuildGradle,
  generateKmpVersionCatalog
};
