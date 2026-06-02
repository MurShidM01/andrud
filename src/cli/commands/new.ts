/**
 * New project creation command with interactive prompts
 */

import {
  select,
  text,
  multiselect,
  isCancel,
  cancel
} from '@clack/prompts';
import {
  printWelcome,
  printSuccess,
  printError,
  printSection,
  printKeyValue,
  printGoodbye,
  printSteps
} from '../../ui/output.js';
import { validateAppName, validatePackageStructure, validateDirectoryPath } from '../../utils/validation.js';
import { generateProject } from '../../core/generator.js';
import { buildDefaultProjectContext, buildTemplateContext } from '../../core/context.js';
import { exists, resolveProjectDirectory } from '../../utils/filesystem.js';
import { getTemplateMetadata, getAllTemplates } from '../../templates/index.js';
import pc from 'picocolors';
import type { TemplateType } from '../../core/types.js';

interface NewCommandOptions {
  name?: string;
  template?: string;
  package?: string;
  packageName?: string;
  directory?: string;
  minSdk?: number | string;
  targetSdk?: number | string;
  force?: boolean;
  skipInstall?: boolean;
  git?: boolean;
  readme?: boolean;
  kotlin?: boolean;
  verbose?: boolean;
  yes?: boolean;
}

function shouldUseDefaults(options: NewCommandOptions): boolean {
  return options.yes === true || !process.stdin.isTTY;
}

function parseSdkOption(value: number | string | undefined, label: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return parsed;
}

function packageOption(options: NewCommandOptions): string | undefined {
  return options.packageName ?? options.package;
}

/**
 * Create a new Android project
 */
export async function createNewCommand(
  name?: string,
  options: NewCommandOptions = {}
): Promise<void> {
  try {
    // Print welcome banner
    printWelcome();

    // Get all available templates
    const templates = getAllTemplates();

    // Step 1: Select template
    let selectedTemplate: string;
    if (options.template) {
      const meta = getTemplateMetadata(options.template as TemplateType);
      if (!meta) {
        printError(`Unknown template: ${options.template}`);
        console.log('Available templates:');
        templates.forEach(t => console.log(`  - ${t.id}`));
        return;
      }
      selectedTemplate = options.template;
    } else if (shouldUseDefaults(options)) {
      selectedTemplate = 'kotlin-compose';
    } else {
      const templateOptions = templates.map(t => ({
        label: `${t.name}`,
        value: t.id,
        hint: t.keywords.slice(0, 2).join(', ')
      }));

      const templateResult = await select({
        message: '? Select a project template',
        options: templateOptions
      });

      if (isCancel(templateResult)) {
        cancel();
        return;
      }

      selectedTemplate = templateResult as string;
    }

    printSection(`Template: ${selectedTemplate}`);

    // Step 2: Get app name
    let appName: string;
    if (name) {
      const validation = validateAppName(name);
      if (!validation.valid) {
        printError('Invalid app name', validation.errors.join(', '));
        return;
      }
      appName = validation.normalized ?? name;
    } else if (shouldUseDefaults(options)) {
      appName = 'MyAwesomeApp';
    } else {
      const nameResult = await text({
        message: '? What is the app name?',
        placeholder: 'MyAwesomeApp',
        defaultValue: 'MyAwesomeApp',
        validate: (value: string) => {
          const result = validateAppName(value);
          if (!result.valid) {
            return result.errors[0];
          }
          return undefined;
        }
      });

      if (isCancel(nameResult)) {
        cancel();
        return;
      }

      const validation = validateAppName(nameResult as string);
      if (!validation.valid) {
        printError('Invalid app name', validation.errors.join(', '));
        return;
      }
      appName = validation.normalized ?? (nameResult as string);
    }

    // Step 3: Get package name
    let packageName: string;
    const packageInput = packageOption(options);
    if (packageInput) {
      const validation = validatePackageStructure(packageInput);
      if (!validation.valid) {
        printError('Invalid package name', validation.errors.join(', '));
        return;
      }
      packageName = packageInput;
    } else {
      // Generate default package name from app name
      const defaultPackage = `com.example.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      if (shouldUseDefaults(options)) {
        packageName = defaultPackage;
      } else {
        const packageResult = await text({
          message: '? What is the package name?',
          placeholder: 'com.example.myapp',
          defaultValue: defaultPackage,
          validate: (value: string) => {
            const result = validatePackageStructure(value);
            if (!result.valid) {
              return result.errors[0];
            }
            return undefined;
          }
        });

        if (isCancel(packageResult)) {
          cancel();
          return;
        }

        const validation = validatePackageStructure(packageResult as string);
        if (!validation.valid) {
          printError('Invalid package name', validation.errors.join(', '));
          return;
        }
        packageName = packageResult as string;
      }
    }

    // Step 4: Get project directory
    let projectDirectory: string;
    const defaultDir = './';
    if (options.directory) {
      const validation = validateDirectoryPath(options.directory);
      if (!validation.valid) {
        printError('Invalid directory', validation.errors.join(', '));
        return;
      }
      projectDirectory = resolveProjectDirectory(validation.normalized ?? options.directory, appName);
    } else if (shouldUseDefaults(options)) {
      projectDirectory = resolveProjectDirectory(defaultDir, appName);
    } else {
      const dirResult = await text({
        message: '? Parent directory for the project?',
        placeholder: './Android-Apps',
        defaultValue: defaultDir,
        validate: (value: string) => {
          const result = validateDirectoryPath(value);
          if (!result.valid) {
            return result.errors[0];
          }
          return undefined;
        }
      });

      if (isCancel(dirResult)) {
        cancel();
        return;
      }

      const validation = validateDirectoryPath(dirResult as string);
      if (!validation.valid) {
        printError('Invalid directory', validation.errors.join(', '));
        return;
      }
      projectDirectory = resolveProjectDirectory(validation.normalized ?? (dirResult as string), appName);
    }

    // Step 5: Optional features
    let selectedFeatures: string[];
    if (shouldUseDefaults(options)) {
      selectedFeatures = ['git', 'readme', 'androidX', 'kotlinDsl'];
    } else {
      const featureOptions = [
        { label: 'Git ignore file', value: 'git', hint: 'Generate .gitignore', selected: true },
        { label: 'README.md', value: 'readme', hint: 'Generate readme', selected: true },
        { label: 'AndroidX libraries', value: 'androidX', hint: 'Use AndroidX (recommended)', selected: true },
        { label: 'Kotlin DSL', value: 'kotlinDsl', hint: 'Use Kotlin DSL for Gradle', selected: true }
      ];

      const featuresResult = await multiselect({
        message: '? Select additional features (optional)',
        options: featureOptions,
        required: false
      });

      if (isCancel(featuresResult)) {
        cancel();
        return;
      }

      selectedFeatures = featuresResult as string[];
    }

    const features = {
      git: options.git ?? selectedFeatures.includes('git'),
      readme: options.readme ?? selectedFeatures.includes('readme'),
      androidX: selectedFeatures.includes('androidX'),
      kotlinDsl: selectedFeatures.includes('kotlinDsl')
    };

    const minSdk = parseSdkOption(options.minSdk, '--min-sdk');
    const targetSdk = parseSdkOption(options.targetSdk, '--target-sdk');

    // Build context
    const baseContext = buildDefaultProjectContext(
      appName,
      packageName,
      projectDirectory,
      selectedTemplate as TemplateType,
      features,
      minSdk,
      targetSdk
    );

    const context = buildTemplateContext({
      appName: baseContext.appName,
      packageName: baseContext.packageName,
      projectDirectory: baseContext.projectDirectory,
      template: baseContext.template,
      uiFramework: baseContext.uiFramework,
      language: baseContext.language,
      android: baseContext.android,
      gradle: baseContext.gradle,
      features: baseContext as unknown as Record<string, boolean>,
      nativeCpp: baseContext.nativeCpp
    });

    // Check if directory exists
    const dirExists = await exists(projectDirectory);
    if (dirExists && !options.force) {
      printError(
        `Directory "${projectDirectory}" already exists`,
        'Use --force to overwrite existing files'
      );
      return;
    }

    // Generate project
    console.log('');
    printSection('Generating Project');

    const result = await generateProject(context, {
      overwrite: options.force,
      dryRun: false,
      skipInstall: options.skipInstall,
      verbose: options.verbose ?? false
    });

    if (result.success) {
      printSuccess('Project generated successfully!');
      printKeyValue([
        { key: 'Project', value: appName },
        { key: 'Package', value: packageName },
        { key: 'Template', value: selectedTemplate },
        { key: 'Location', value: projectDirectory },
        { key: 'Files created', value: result.generatedFiles.length.toString() },
        { key: 'Duration', value: `${(result.duration / 1000).toFixed(1)}s` }
      ]);

      console.log('');
      printSteps([
        `cd ${projectDirectory}`,
        'Open in Android Studio: studio .',
        'Or build from command line: ./gradlew assembleDebug'
      ]);

      printGoodbye(true);
    } else {
      printError('Project generation failed');
      if (result.errors.length > 0) {
        console.log('');
        result.errors.forEach(err => {
          console.log(`  ${pc.red('•')} ${err.file ? `${err.file}: ` : ''}${err.message}`);
        });
      }
      printGoodbye(false);
    }
  } catch (error) {
    printError('An unexpected error occurred', (error as Error).message);
    if (process.env.DEBUG || process.env.VERBOSE) {
      console.error(error);
    }
    printGoodbye(false);
    process.exit(1);
  }
}

// Export for use in CLI
export type { NewCommandOptions };