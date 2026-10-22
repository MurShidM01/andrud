/**
 * Project generator - orchestrates Android project directory structure and file creation
 */

import { exists, writeFile, createDirectory, isDirectory, readDirectory } from '../utils/filesystem.js';
import type { TemplateContext, GenerationResult, GeneratedFile } from './types.js';
import { validateContext } from './context.js';
import {
  generateSettingsGradle,
  generateRootBuildGradle,
  generateGradleProperties,
  generateGitIgnore,
  generateReadme,
  generateGradleWrapperProperties,
  generateGradlewBat,
  generateGradlewUnix,
  generateGradleWrapperJar,
  generateAppBuildGradle,
  generateAppProguardRules,
  generateAppManifest,
  generateApplicationClass,
  generateMainActivity,
  generateStrings,
  generateColors,
  generateThemes,
  generateAppIcon,
  generateActivityLayout,
  generateSourceSetFiles,
  generateKmpFiles,
  getKmpDirectories
} from '../templates/index.js';
import pc from 'picocolors';
import { chmod } from 'fs/promises';
import { join } from 'path';

export { validateContext };

export interface GeneratorOptions {
  overwrite?: boolean;
  skipInstall?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Validate project directory can be used
 */
export async function validateProjectDirectory(
  projectPath: string,
  options: { overwrite: boolean } = { overwrite: false }
): Promise<{ valid: boolean; error?: string; existingFiles?: string[] }> {
  const pathExists = await exists(projectPath);

  if (pathExists) {
    const isDir = await isDirectory(projectPath);
    if (!isDir) {
      return { valid: false, error: 'Project path exists but is not a directory' };
    }

    const dirContent = await getDirectoryContents(projectPath);
    if (dirContent.length > 0 && !options.overwrite) {
      return {
        valid: false,
        error: 'Directory is not empty. Use --force to overwrite existing files.',
        existingFiles: dirContent
      };
    }
  }

  return { valid: true };
}

/**
 * Prepare project directory structure
 */
export async function prepareProjectStructure(
  projectPath: string,
  context: TemplateContext
): Promise<{ success: boolean; createdPaths: string[]; errors: string[] }> {
  const createdPaths: string[] = [];
  const errors: string[] = [];

  await createDirectory(projectPath);

  if (context.template === 'kotlin-multiplatform') {
    const kmpDirs = getKmpDirectories(context);
    for (const dir of kmpDirs) {
      const fullPath = join(projectPath, dir);
      try {
        await createDirectory(fullPath);
        createdPaths.push(dir);
      } catch (error) {
        errors.push(`Failed to create directory ${dir}: ${(error as Error).message}`);
      }
    }
    return { success: errors.length === 0, createdPaths, errors };
  }

  const packagePath = context.packageName.replace(/\./g, '/');
  const sourceRoot = context.language === 'kotlin' ? 'kotlin' : 'java';

  const directories = [
    'gradle/wrapper',
    `app/src/main/${sourceRoot}/${packagePath}`,
    'app/src/main/res/layout',
    'app/src/main/res/values',
    'app/src/main/res/values-night',
    'app/src/main/res/drawable',
    'app/src/main/res/xml',
    'app/src/main/res/mipmap-anydpi',
    'app/src/main/res/mipmap-anydpi-v26',
    `app/src/test/${sourceRoot}/${packagePath}`,
    `app/src/androidTest/${sourceRoot}/${packagePath}`
  ];

  // Add UI theme directories for Jetpack Compose projects
  if (context.uiFramework === 'compose' && context.language === 'kotlin') {
    directories.push(`app/src/main/kotlin/${packagePath}/ui/theme`);
  }

  // Add native cpp directory
  if (context.template === 'native-cpp') {
    directories.push('app/src/main/cpp');
  }

  for (const dir of directories) {
    const fullPath = join(projectPath, dir);
    try {
      await createDirectory(fullPath);
      createdPaths.push(dir);
    } catch (error) {
      errors.push(`Failed to create directory ${dir}: ${(error as Error).message}`);
    }
  }

  return { success: errors.length === 0, createdPaths, errors };
}

/**
 * Assemble the complete list of files to generate for a given template context
 */
export function collectProjectFiles(context: TemplateContext): GeneratedFile[] {
  if (context.template === 'kotlin-multiplatform') {
    return [
      context.git ? generateGitIgnore(context) : null,
      context.readme ? generateReadme(context) : null,
      ...generateKmpFiles(context)
    ].filter((f): f is GeneratedFile => f !== null);
  }

  return [
    generateSettingsGradle(context),
    generateRootBuildGradle(context),
    generateGradleProperties(context),
    context.git ? generateGitIgnore(context) : null,
    context.readme ? generateReadme(context) : null,
    generateGradleWrapperProperties(context),
    generateGradlewBat(context),
    generateGradlewUnix(context),
    generateGradleWrapperJar(context),
    generateAppBuildGradle(context),
    generateAppProguardRules(context),
    generateAppManifest(context),
    generateApplicationClass(context),
    generateMainActivity(context),
    generateStrings(context),
    generateColors(context),
    generateThemes(context),
    generateAppIcon(context),
    generateActivityLayout(context),
    ...generateSourceSetFiles(context)
  ].filter((f): f is GeneratedFile => f !== null);
}

/**
 * Generate all project files
 */
export async function generateProject(
  context: TemplateContext,
  options: GeneratorOptions = {}
): Promise<GenerationResult> {
  const startTime = Date.now();
  const generatedFiles: string[] = [];
  const skippedFiles: string[] = [];
  const errors: Array<{ file?: string; message: string; code?: string }> = [];
  const warnings: string[] = [];
  const projectPath = context.projectDirectory;

  const contextValidation = validateContext(context);
  if (!contextValidation.valid) {
    return {
      success: false,
      projectPath,
      generatedFiles: [],
      skippedFiles: [],
      errors: contextValidation.errors.map((msg) => ({ message: msg })),
      warnings,
      duration: Date.now() - startTime
    };
  }

  const dirValidation = await validateProjectDirectory(projectPath, {
    overwrite: options.overwrite ?? false
  });
  if (!dirValidation.valid) {
    return {
      success: false,
      projectPath,
      generatedFiles: [],
      skippedFiles: [],
      errors: [{ message: dirValidation.error!, code: 'DIR_VALIDATION_ERROR' }],
      warnings,
      duration: Date.now() - startTime
    };
  }

  if (!options.dryRun) {
    const prepResult = await prepareProjectStructure(projectPath, context);
    if (!prepResult.success) {
      errors.push(...prepResult.errors.map((msg) => ({ message: msg, code: 'DIR_CREATE_ERROR' })));
    }
  }

  const filesToGenerate = collectProjectFiles(context);

  for (const file of filesToGenerate) {
    try {
      const filePath = join(projectPath, file.path);
      const fileExists = await exists(filePath);

      if (fileExists && !options.overwrite && file.overwrite !== true) {
        skippedFiles.push(file.path);
        if (options.verbose) {
          console.log(pc.yellow(`Skipped: ${file.path} (already exists)`));
        }
        continue;
      }

      if (!options.dryRun) {
        await writeFile(filePath, file.content);
        if (file.executable) {
          await chmod(filePath, 0o755);
        }
      }
      generatedFiles.push(file.path);

      if (options.verbose) {
        const action = options.dryRun ? 'Would generate' : 'Generated';
        console.log(pc.green(`${action}: ${file.path}`));
      }
    } catch (error) {
      errors.push({
        file: file.path,
        message: (error as Error).message,
        code: 'WRITE_ERROR'
      });
    }
  }

  const duration = Date.now() - startTime;
  const success = errors.length === 0;

  return {
    success,
    projectPath,
    generatedFiles,
    skippedFiles,
    errors,
    warnings,
    duration
  };
}

/**
 * Get directory contents
 */
export async function getDirectoryContents(path: string): Promise<string[]> {
  try {
    return await readDirectory(path);
  } catch {
    return [];
  }
}
