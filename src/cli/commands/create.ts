/**
 * Clean, minimal Vite-style project creation command
 */

import {
  text,
  select,
  confirm,
  isCancel,
  cancel,
  spinner
} from '@clack/prompts';
import { generateProject } from '../../core/generator.js';
import { buildDefaultProjectContext, buildTemplateContext } from '../../core/context.js';
import { exists, resolveProjectDirectory } from '../../utils/filesystem.js';
import { getAllTemplates, getTemplateMetadata } from '../../templates/index.js';
import type { TemplateType } from '../../core/types.js';
import pc from 'picocolors';
import { platform } from 'os';

/**
 * Create a new Android project with clean minimal UI
 */
export async function createCommand(options: { force?: boolean } = {}): Promise<void> {
  // ============================================
  // Step 1: App Name
  // ============================================
  console.log('');

  let appName: string;
  const nameResult = await text({
    message: '  ? Project name:',
    placeholder: 'MyApp',
    defaultValue: 'MyApp',
  });

  if (isCancel(nameResult)) {
    cancel();
    return;
  }

  appName = nameResult.trim();
  if (!appName || !/^[a-zA-Z]/.test(appName)) {
    console.log(pc.red('\n  ✘ Project name must start with a letter\n'));
    return;
  }

  // ============================================
  // Step 2: Template Selection
  // ============================================
  const templates = getAllTemplates();

  const templateOptions = templates.map(t => ({
    label: t.name,
    value: t.id,
    hint: t.language === 'kotlin' ? 'Kotlin' : 'Java'
  }));

  const templateResult = await select({
    message: '  ? Select template:',
    options: templateOptions
  });

  if (isCancel(templateResult)) {
    cancel();
    return;
  }

  const selectedTemplate = templateResult as TemplateType;
  const selectedMeta = getTemplateMetadata(selectedTemplate);

  // ============================================
  // Step 3: Package Name
  // ============================================
  const defaultPackage = `com.example.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  const packageResult = await text({
    message: '  ? Package name:',
    placeholder: defaultPackage,
    defaultValue: defaultPackage,
  });

  if (isCancel(packageResult)) {
    cancel();
    return;
  }

  const packageName = packageResult.trim().toLowerCase();
  if (!packageName || !/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName)) {
    console.log(pc.red('\n  ✘ Invalid package name format (e.g., com.example.myapp)\n'));
    return;
  }

  // ============================================
  // Step 4: Directory
  // ============================================
  const defaultBaseDir = platform() === 'win32' ? 'D:\\Projects\\Android' : './Android-Apps';
  const dirResult = await text({
    message: '  ? Parent directory for the project:',
    placeholder: defaultBaseDir,
    defaultValue: defaultBaseDir,
  });

  if (isCancel(dirResult)) {
    cancel();
    return;
  }

  // Normalize and append app name as project folder
  let baseDir = dirResult.trim();
  
  if (!baseDir) {
    console.log(pc.red('\n  ✘ Directory path cannot be empty\n'));
    return;
  }

  const projectDirectory = resolveProjectDirectory(baseDir, appName);

  // Check if directory exists
  const dirExists = await exists(projectDirectory);
  if (dirExists) {
    if (!options.force) {
      console.log(pc.red(`\n  ✘ Directory already exists: ${projectDirectory}`));
      console.log(pc.gray('    Use --force to overwrite\n'));
      return;
    }
  }

  // ============================================
  // Step 5: Summary & Confirm
  // ============================================
  console.log('');
  console.log(pc.gray('─').repeat(50));
  console.log('');
  console.log(`   ${pc.cyan('Project:')} ${pc.bold(appName)}`);
  console.log(`   ${pc.cyan('Template:')} ${selectedMeta?.name}`);
  console.log(`   ${pc.cyan('Package:')} ${packageName}`);
  console.log(`   ${pc.cyan('Path:')} ${projectDirectory}`);
  console.log('');

  const shouldCreate = await confirm({
    message: '  Create project?',
    initialValue: true
  });

  if (isCancel(shouldCreate)) {
    cancel();
    return;
  }

  if (!shouldCreate) {
    console.log(pc.gray('\n  Cancelled.\n'));
    return;
  }

  // ============================================
  // Generate Project
  // ============================================
  console.log('');

  const s = spinner();
  s.start('  Creating project...');

  // Build context
  const baseContext = buildDefaultProjectContext(
    appName,
    packageName,
    projectDirectory,
    selectedTemplate,
    { git: true, readme: true, androidX: true, kotlinDsl: true }
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

  // Generate the project
  const result = await generateProject(context, {
    overwrite: options.force ?? false,
    dryRun: false,
    skipInstall: false,
    verbose: false
  });

  s.stop('  Done!');

  if (result.success) {
    console.log('');
    console.log(pc.green(`  ✓ Project "${appName}" created`));
    console.log(pc.gray('─'.repeat(50)));
    console.log('');
    console.log(pc.gray(`  cd ${projectDirectory}`));
    console.log(pc.gray('  ./gradlew assembleDebug'));
    console.log(pc.gray('  studio .'));
    console.log('');
  } else {
    console.log(pc.red('\n  ✘ Failed to create project'));
    result.errors.forEach(err => {
      console.log(`    ${pc.red('•')} ${err.file ? `${err.file}: ` : ''}${err.message}`);
    });
    console.log('');
  }
}