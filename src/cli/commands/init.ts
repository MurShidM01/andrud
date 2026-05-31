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
import { validatePackageStructure } from '../../utils/validation.js';
import { generateProject } from '../../core/generator.js';
import { buildDefaultProjectContext, buildTemplateContext } from '../../core/context.js';
import { getCurrentWorkingDirectory } from '../../utils/filesystem.js';
import { getTemplateMetadata, getAllTemplates } from '../../templates/index.js';
import pc from 'picocolors';
import type { TemplateType } from '../../core/types.js';

interface InitCommandOptions {
  force: boolean;
  template?: string;
}

/**
 * Initialize Android project in current directory
 */
export async function createInitCommand(
  _options: InitCommandOptions,
  args?: { template?: string }
): Promise<void> {
  try {
    printWelcome();

    const cwd = getCurrentWorkingDirectory();
    const projectName = cwd.split(/[\\/]/).pop() ?? 'MyApp';

    printSection('Initialize Android Project');
    console.log(`Current directory: ${pc.cyan(cwd)}`);
    console.log('');

    // Get templates
    const templates = getAllTemplates();

    // Step 1: Select template
    let selectedTemplate: string;
    if (args?.template) {
      const meta = getTemplateMetadata(args.template as TemplateType);
      if (!meta) {
        printError(`Unknown template: ${args.template}`);
        return;
      }
      selectedTemplate = args.template;
    } else {
      const templateOptions = templates.map(t => ({
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
    const defaultPackage = `com.example.${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
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

    const packageName = packageResult as string;
    const validation = validatePackageStructure(packageName);
    if (!validation.valid) {
      printError('Invalid package name', validation.errors.join(', '));
      return;
    }

    // Confirm initialization
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
      }
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

    // Generate project
    printSection('Generating Project');

    const result = await generateProject(context, {
      overwrite: true,
      dryRun: false,
      skipInstall: false,
      verbose: false
    });

    if (result.success) {
      printSuccess('Project initialized successfully!');
      printKeyValue([
        { key: 'Package', value: packageName },
        { key: 'Template', value: selectedTemplate },
        { key: 'Location', value: cwd },
        { key: 'Files created', value: result.generatedFiles.length.toString() }
      ]);

      printGoodbye(true);
    } else {
      printError('Project initialization failed');
      if (result.errors.length > 0) {
        result.errors.forEach(err => {
          console.log(`  ${pc.red('•')} ${err.file ? `${err.file}: ` : ''}${err.message}`);
        });
      }
      printGoodbye(false);
    }
  } catch (error) {
    printError('An unexpected error occurred', (error as Error).message);
    printGoodbye(false);
    process.exit(1);
  }
}