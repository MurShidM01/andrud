/**
 * Kotlin Multiplatform (KMP) CLI command
 * Scaffolds a cross-platform Kotlin Multiplatform & Compose Multiplatform project
 */

import { text, multiselect, confirm, isCancel, cancel, spinner } from '@clack/prompts';
import pc from 'picocolors';
import { homedir } from 'os';
import { join } from 'path';
import {
  validateAppName,
  validatePackageNameInput,
  validateDirectoryPath,
  validateAndroidMinSdk,
  validateAndroidTargetSdk,
  deriveDefaultPackageName
} from '../../utils/validation.js';
import { exists, resolveProjectDirectory } from '../../utils/filesystem.js';
import { DEFAULT_KMP_PLATFORMS, parseKmpPlatforms } from '../../core/config.js';
import { kotlinMultiplatformPlugin } from '../../plugins/kotlin-multiplatform.js';
import type { KmpPlatform } from '../../core/types.js';

export interface KmpCommandOptions {
  package?: string;
  packageName?: string;
  directory?: string;
  platforms?: string;
  minSdk?: number | string;
  targetSdk?: number | string;
  force?: boolean;
  yes?: boolean;
}

function shouldUseDefaults(options: KmpCommandOptions): boolean {
  return options.yes === true || !process.stdin.isTTY;
}

/**
 * Create a new cross-platform Kotlin Multiplatform project
 */
export async function createKmpCommand(
  name?: string,
  options: KmpCommandOptions = {}
): Promise<void> {
  // Step 1: Project Name
  let appName: string;
  if (name) {
    const validation = validateAppName(name);
    if (!validation.valid) {
      console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
      process.exitCode = 1;
      return;
    }
    appName = validation.normalized ?? name.trim();
  } else if (shouldUseDefaults(options)) {
    appName = 'MyKmpApp';
  } else {
    const nameResult = await text({
      message: '  Project name',
      placeholder: 'MyKmpApp',
      defaultValue: 'MyKmpApp',
      validate: (value) => {
        const res = validateAppName(value ?? '');
        return res.valid ? undefined : res.errors[0];
      }
    });

    if (isCancel(nameResult)) {
      cancel();
      return;
    }

    const validation = validateAppName(nameResult);
    if (!validation.valid) {
      console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
      process.exitCode = 1;
      return;
    }
    appName = validation.normalized ?? nameResult.trim();
  }

  // Step 2: Target Platforms
  let platforms: KmpPlatform[];
  if (options.platforms) {
    try {
      platforms = parseKmpPlatforms(options.platforms);
    } catch (error) {
      console.log(pc.red(`\n  ✘ ${(error as Error).message}\n`));
      process.exitCode = 1;
      return;
    }
  } else if (shouldUseDefaults(options)) {
    platforms = [...DEFAULT_KMP_PLATFORMS];
  } else {
    const platformResult = await multiselect({
      message: '  Select target platforms',
      options: [
        { label: 'Android', value: 'android', hint: 'Jetpack Compose + Android target' },
        { label: 'iOS', value: 'ios', hint: 'iosX64, iosArm64, iosSimulatorArm64 + SwiftUI host' },
        { label: 'Desktop (JVM)', value: 'desktop', hint: 'Compose for Desktop (Windows/macOS/Linux)' },
        { label: 'Web (Kotlin/Wasm)', value: 'wasmJs', hint: 'Compose for Web (WasmJS browser)' }
      ],
      initialValues: [...DEFAULT_KMP_PLATFORMS],
      required: true
    });

    if (isCancel(platformResult)) {
      cancel();
      return;
    }

    platforms = parseKmpPlatforms(platformResult as KmpPlatform[]);
  }

  // Step 3: Package Name
  const defaultPkg = deriveDefaultPackageName(appName);
  const pkgOption = options.packageName ?? options.package;
  let packageName: string;

  if (pkgOption) {
    const validation = validatePackageNameInput(pkgOption);
    if (!validation.valid) {
      console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
      process.exitCode = 1;
      return;
    }
    packageName = pkgOption.trim().toLowerCase();
  } else if (shouldUseDefaults(options)) {
    packageName = defaultPkg;
  } else {
    const pkgResult = await text({
      message: '  Package name',
      placeholder: defaultPkg,
      defaultValue: defaultPkg,
      validate: (value) => {
        const res = validatePackageNameInput(value ?? '');
        return res.valid ? undefined : res.errors[0];
      }
    });

    if (isCancel(pkgResult)) {
      cancel();
      return;
    }

    const validation = validatePackageNameInput(pkgResult);
    if (!validation.valid) {
      console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
      process.exitCode = 1;
      return;
    }
    packageName = pkgResult.trim().toLowerCase();
  }

  // Step 4: Directory
  const defaultBaseDir = join(homedir(), 'AndroidStudioProjects');
  let baseDir: string;

  if (options.directory) {
    const validation = validateDirectoryPath(options.directory);
    if (!validation.valid) {
      console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
      process.exitCode = 1;
      return;
    }
    baseDir = validation.normalized ?? options.directory.trim();
  } else if (shouldUseDefaults(options)) {
    baseDir = './';
  } else {
    const dirResult = await text({
      message: '  Save to directory',
      placeholder: defaultBaseDir,
      defaultValue: defaultBaseDir,
      validate: (value) => {
        const res = validateDirectoryPath(value ?? '');
        return res.valid ? undefined : res.errors[0];
      }
    });

    if (isCancel(dirResult)) {
      cancel();
      return;
    }

    const validation = validateDirectoryPath(dirResult);
    if (!validation.valid) {
      console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
      process.exitCode = 1;
      return;
    }
    baseDir = validation.normalized ?? dirResult.trim();
  }

  const projectDirectory = resolveProjectDirectory(baseDir, appName);
  const dirExists = await exists(projectDirectory);
  if (dirExists && !options.force) {
    console.log(pc.red(`\n  ✘ Directory already exists: ${projectDirectory}`));
    console.log(pc.gray('    Use --force to overwrite\n'));
    process.exitCode = 1;
    return;
  }

  let minSdk: number | undefined;
  let targetSdk: number | undefined;

  if (options.minSdk !== undefined) {
    const validation = validateAndroidMinSdk(options.minSdk);
    if (!validation.valid) {
      console.log(pc.red(`\n  ✘ --min-sdk: ${validation.errors.join(', ')}\n`));
      process.exitCode = 1;
      return;
    }
    minSdk =
      typeof options.minSdk === 'number'
        ? options.minSdk
        : Number.parseInt(String(options.minSdk).trim(), 10);
  }

  if (options.targetSdk !== undefined) {
    const validation = validateAndroidTargetSdk(options.targetSdk);
    if (!validation.valid) {
      console.log(pc.red(`\n  ✘ --target-sdk: ${validation.errors.join(', ')}\n`));
      process.exitCode = 1;
      return;
    }
    targetSdk =
      typeof options.targetSdk === 'number'
        ? options.targetSdk
        : Number.parseInt(String(options.targetSdk).trim(), 10);
  }

  if (minSdk !== undefined && targetSdk !== undefined && minSdk > targetSdk) {
    console.log(
      pc.red(`\n  ✘ --min-sdk (${minSdk}) cannot be greater than --target-sdk (${targetSdk})\n`)
    );
    process.exitCode = 1;
    return;
  }

  // Step 5: Summary & Confirm
  console.log('');
  console.log(pc.gray('─').repeat(50));
  console.log('');
  console.log(`   ${pc.cyan('Project:')}   ${pc.bold(appName)}`);
  console.log(`   ${pc.cyan('Plugin:')}    ${kotlinMultiplatformPlugin.name} (Kotlin ${kotlinMultiplatformPlugin.version})`);
  console.log(`   ${pc.cyan('Targets:')}   ${platforms.join(', ')}`);
  console.log(`   ${pc.cyan('Package:')}   ${packageName}`);
  console.log(`   ${pc.cyan('Path:')}      ${projectDirectory}`);
  console.log('');

  if (!shouldUseDefaults(options)) {
    const shouldCreate = await confirm({
      message: '  Create Kotlin Multiplatform project?',
      initialValue: true
    });

    if (isCancel(shouldCreate) || !shouldCreate) {
      if (isCancel(shouldCreate)) cancel();
      else console.log(pc.gray('\n  Cancelled.\n'));
      return;
    }
  }

  const s = process.stdout.isTTY ? spinner() : null;
  s?.start('  Scaffolding Kotlin Multiplatform project...');

  const result = await kotlinMultiplatformPlugin.scaffold({
    appName,
    packageName,
    directory: baseDir,
    platforms,
    minSdk,
    targetSdk,
    generatorOptions: {
      overwrite: options.force ?? false
    }
  });

  s?.stop('  Done!');

  if (result.success) {
    console.log('');
    console.log(pc.green(`  ✓ Kotlin Multiplatform project "${appName}" created`));
    console.log(pc.gray('─'.repeat(50)));
    console.log('');
    console.log(pc.gray(`  cd ${projectDirectory}`));
    console.log(pc.gray('  ./kotlin build'));
    if (platforms.includes('android')) {
      console.log(pc.gray('  ./kotlin run -m androidApp'));
    }
    if (platforms.includes('desktop')) {
      console.log(pc.gray('  ./kotlin run -m desktopApp'));
    }
    if (platforms.includes('wasmJs')) {
      console.log(pc.gray('  ./kotlin run -m webApp'));
    }
    console.log('');
  } else {
    console.log(pc.red('\n  ✘ Failed to create Kotlin Multiplatform project'));
    result.errors.forEach((err) => {
      console.log(`    ${pc.red('•')} ${err.file ? `${err.file}: ` : ''}${err.message}`);
    });
    console.log('');
    process.exitCode = 1;
  }
}
