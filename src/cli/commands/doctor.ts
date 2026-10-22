/**
 * Environment & toolchain diagnostics command (`andrud doctor`)
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { homedir, platform, arch } from 'node:os';
import { join } from 'node:path';
import pc from 'picocolors';
import { exists } from '../../utils/filesystem.js';
import { getPackageVersion } from '../../utils/version.js';

const execFileAsync = promisify(execFile);

export interface DoctorCheckResult {
  name: string;
  status: 'ok' | 'warn' | 'missing';
  version?: string;
  details: string;
  hint?: string;
}

export interface DoctorCommandOptions {
  json?: boolean;
}

async function runToolVersion(
  cmd: string,
  args: string[]
): Promise<{ ok: boolean; output: string }> {
  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, { timeout: 4000 });
    const combined = `${stdout}\n${stderr}`.trim();
    const firstLine = combined.split(/\r?\n/).find((l) => l.trim().length > 0) ?? '';
    return { ok: true, output: firstLine.trim() };
  } catch {
    return { ok: false, output: '' };
  }
}

async function detectAndroidSdk(): Promise<{ found: boolean; path?: string }> {
  const envCandidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT
  ].filter((v): v is string => Boolean(v && v.trim()));

  for (const candidate of envCandidates) {
    if (await exists(candidate)) {
      return { found: true, path: candidate };
    }
  }

  const home = homedir();
  const os = platform();
  const defaultPaths =
    os === 'win32'
      ? [join(process.env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'Android', 'Sdk')]
      : os === 'darwin'
        ? [join(home, 'Library', 'Android', 'sdk')]
        : [join(home, 'Android', 'Sdk'), '/opt/android-sdk', '/usr/lib/android-sdk'];

  for (const candidate of defaultPaths) {
    if (await exists(candidate)) {
      return { found: true, path: candidate };
    }
  }

  return { found: false };
}

/**
 * Run all environment & Android/KMP toolchain checks
 */
export async function runDoctorChecks(): Promise<DoctorCheckResult[]> {
  const results: DoctorCheckResult[] = [];

  // 1. andrud CLI & Node.js runtime
  const nodeVersion = process.versions.node;
  const majorNode = Number.parseInt(nodeVersion.split('.')[0] ?? '0', 10);
  results.push({
    name: 'Node.js Runtime',
    status: majorNode >= 18 ? 'ok' : 'warn',
    version: `v${nodeVersion}`,
    details: `Node.js v${nodeVersion} (${platform()}/${arch()}) — andrud v${getPackageVersion()}`,
    hint: majorNode < 18 ? 'Upgrade to Node.js 18 LTS or newer' : undefined
  });

  // 2. Java / JDK
  const javaCheck = await runToolVersion('java', ['-version']);
  const javaHome = process.env.JAVA_HOME;
  if (javaCheck.ok) {
    results.push({
      name: 'Java / JDK',
      status: 'ok',
      version: javaCheck.output,
      details: javaHome ? `${javaCheck.output} (JAVA_HOME=${javaHome})` : javaCheck.output
    });
  } else {
    results.push({
      name: 'Java / JDK',
      status: 'warn',
      details: 'JDK not found in PATH',
      hint: 'Install JDK 17+ and set JAVA_HOME to build Android and Kotlin Multiplatform apps'
    });
  }

  // 3. Android SDK
  const sdk = await detectAndroidSdk();
  if (sdk.found && sdk.path) {
    results.push({
      name: 'Android SDK',
      status: 'ok',
      details: `Found at ${sdk.path}`
    });
  } else {
    results.push({
      name: 'Android SDK',
      status: 'warn',
      details: 'ANDROID_HOME / Android SDK directory not detected',
      hint: 'Install Android Studio or Android Command-Line Tools and set ANDROID_HOME'
    });
  }

  // 4. Git
  const gitCheck = await runToolVersion('git', ['--version']);
  if (gitCheck.ok) {
    results.push({
      name: 'Git',
      status: 'ok',
      version: gitCheck.output,
      details: gitCheck.output
    });
  } else {
    results.push({
      name: 'Git',
      status: 'warn',
      details: 'Git not found in PATH',
      hint: 'Install Git for version control and repository initialization'
    });
  }

  // 5. Kotlin Compiler (optional system CLI)
  const kotlinCheck = await runToolVersion('kotlinc', ['-version']);
  if (kotlinCheck.ok) {
    results.push({
      name: 'Kotlin CLI',
      status: 'ok',
      version: kotlinCheck.output,
      details: kotlinCheck.output
    });
  } else {
    results.push({
      name: 'Kotlin CLI',
      status: 'ok',
      details: 'Managed automatically per-project via ./gradlew and ./kotlin wrappers'
    });
  }

  return results;
}

/**
 * Execute `andrud doctor` command
 */
export async function createDoctorCommand(options: DoctorCommandOptions = {}): Promise<void> {
  const checks = await runDoctorChecks();

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          version: getPackageVersion(),
          platform: platform(),
          arch: arch(),
          node: process.versions.node,
          checks
        },
        null,
        2
      )
    );
    return;
  }

  console.log('');
  console.log(`  ${pc.cyan(pc.bold('andrud doctor'))} — Environment & Toolchain Diagnostics`);
  console.log(`  ${pc.gray('─'.repeat(54))}`);
  console.log('');

  for (const check of checks) {
    const icon =
      check.status === 'ok'
        ? pc.green('✓')
        : check.status === 'warn'
          ? pc.yellow('!')
          : pc.red('✘');
    console.log(`  ${icon} ${pc.bold(check.name)}: ${check.details}`);
    if (check.hint) {
      console.log(`    ${pc.gray(`→ ${check.hint}`)}`);
    }
  }

  console.log('');
}
