/**
 * Init project command - initialize Android project in current directory
 */

import {
  select,
  text,
  confirm,
  isCancel,
  cancel
} from '@clack/prompts';
import {
  printWelcome,
  printSuccess,
  printError,
  printSection,
  printKeyValue,
  printGoodbye
} from '../../ui/output.js';
import {
  validatePackageStructure,
  deriveValidAppName,
  deriveDefaultPackageName
} from '../../utils/validation.js';
import { generateProject } from '../../core/generator.js';
import { buildDefaultProjectContext, buildTemplateContext } from '../../core/context.js';
import { parseKmpPlatforms } from '../../core/config.js';
import { getCurrentWorkingDirectory } from '../../utils/filesystem.js';
import { getTemplateMetadata, getAllTemplates } from '../../templates/index.js';
import pc from 'picocolors';
import type { TemplateType } from '../../core/types.js';

interface InitCommandOptions {
  force?: boolean;
  template?: string;
  package?: string;
  packageName?: string;
  platforms?: string;
  yes?: boolean;
}

function shouldUseDefaults(options: InitCommandOptions): boolean {
  return options.yes === true || !process.stdin.isTTY;
}

function packageOption(options: InitCommandOptions): string | undefined {
  return options.packageName ?? options.package;
}

/**
 * Initialize Android project in current directory
 */
export async function createInitCommand(
  options: InitCommandOptions = {}
): Promise<void> {
  try {
    printWelcome();

    const cwd = getCurrentWorkingDirectory();
    const rawFolderName = cwd.split(/[\\/]/).filter(Boolean).pop() ?? 'MyApp';
    const projectName = deriveValidAppName(rawFolderName);

    printSection('Initialize Android Project');
    console.log(`Current directory: ${pc.cyan(cwd)}`);
    console.log('');

    // Get templates
    const templates = getAllTemplates();

    // Step 1: Select template
    let selectedTemplate: string;
    if (options.template) {
      const meta = getTemplateMetadata(options.template as TemplateType);
      if (!meta) {
        printError(`Unknown template: ${options.template}`);
        process.exitCode = 1;
        return;
      }
      selectedTemplate = meta.id;
    } else if (shouldUseDefaults(options)) {
      selectedTemplate = 'kotlin-compose';
    } else {
      const templateOptions = templates.map((t) => ({
        label: t.name,
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

    // Step 2: Get package name
    const defaultPackage = deriveDefaultPackageName(projectName);
    const packageInput = packageOption(options);
    let packageName: string;

    if (packageInput) {
      packageName = packageInput.trim().toLowerCase();
    } else if (shouldUseDefaults(options)) {
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

      packageName = (packageResult as string).trim().toLowerCase();
    }

    const validation = validatePackageStructure(packageName);
    if (!validation.valid) {
      printError('Invalid package name', validation.errors.join(', '));
      process.exitCode = 1;
      return;
    }

    // Confirm initialization
    if (!shouldUseDefaults(options)) {
      const confirmInit = await confirm({
        message: `? Initialize Android project in ${cwd}?`,
        initialValue: true
      });

      if (isCancel(confirmInit)) {
        cancel();
        return;
      }

      if (!confirmInit) {
        console.log('Initialization cancelled.');
        return;
      }
    }

    const kmpPlatforms =
      selectedTemplate === 'kotlin-multiplatform' && options.platforms
        ? parseKmpPlatforms(options.platforms)
        : undefined;

    // Build context
    const baseContext = buildDefaultProjectContext(
      projectName,
      packageName,
      cwd,
      selectedTemplate as TemplateType,
      {
        git: true,
        readme: true,
        androidX: true,
        kotlinDsl: true
      },
      undefined,
      undefined,
      kmpPlatforms
    );

    const context = buildTemplateContext(baseContext);

    // Generate project
    printSection('Generating Project');

    const result = await generateProject(context, {
      overwrite: options.force ?? false,
      dryRun: false,
      skipInstall: false,
      verbose: false
    });

    if (result.success) {
      printSuccess('Project initialized successfully!');
      printKeyValue([
        { key: 'Project', value: projectName },
        { key: 'Package', value: packageName },
        { key: 'Template', value: selectedTemplate },
        { key: 'Location', value: cwd },
        { key: 'Files created', value: result.generatedFiles.length.toString() }
      ]);

      printGoodbye(true);
    } else {
      printError('Project initialization failed');
      if (result.errors.length > 0) {
        result.errors.forEach((err) => {
          console.log(`  ${pc.red('•')} ${err.file ? `${err.file}: ` : ''}${err.message}`);
        });
      }
      printGoodbye(false);
      process.exitCode = 1;
    }
  } catch (error) {
    printError('An unexpected error occurred', (error as Error).message);
    printGoodbye(false);
    process.exitCode = 1;
  }
}

export type { InitCommandOptions };
