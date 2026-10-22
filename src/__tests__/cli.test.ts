/**
 * Test suite for CLI commands & Kotlin Multiplatform Plugin
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createCommand } from '../cli/commands/create.js';
import { createNewCommand } from '../cli/commands/new.js';
import { createKmpCommand } from '../cli/commands/kmp.js';
import { createListCommand } from '../cli/commands/list.js';
import { createInfoCommand } from '../cli/commands/info.js';
import { createDoctorCommand } from '../cli/commands/doctor.js';
import { kotlinMultiplatformPlugin } from '../plugins/kotlin-multiplatform.js';
import { getPackageVersion } from '../utils/version.js';
import { exists } from '../utils/filesystem.js';

async function captureConsoleOutput(fn: () => Promise<void>): Promise<string[]> {
  const logs: string[] = [];
  const origLog = console.log;
  const origError = console.error;
  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '));
  };
  console.error = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '));
  };
  try {
    await fn();
  } finally {
    console.log = origLog;
    console.error = origError;
  }
  return logs;
}

test('CLI Commands & KMP Plugin', async (t) => {
  await t.test('package version should be upgraded to 1.0.6', () => {
    assert.strictEqual(getPackageVersion(), '1.0.6');
  });

  await t.test('createCommand should scaffold project in non-interactive mode', async () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'andrud-cli-create-'));
    try {
      await captureConsoleOutput(() =>
        createCommand('CliTestApp', {
          template: 'kotlin-compose',
          package: 'com.example.clitestapp',
          directory: tempRoot,
          yes: true,
          force: true
        })
      );

      const createdDir = join(tempRoot, 'clitestapp');
      assert.strictEqual(await exists(join(createdDir, 'settings.gradle.kts')), true);
      assert.strictEqual(await exists(join(createdDir, 'app/build.gradle.kts')), true);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  await t.test('createNewCommand should scaffold project and respect --no-git / --no-readme', async () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'andrud-cli-new-'));
    try {
      await captureConsoleOutput(() =>
        createNewCommand('NewCliApp', {
          template: 'java-xml',
          package: 'com.example.newcliapp',
          directory: tempRoot,
          git: false,
          readme: false,
          minSdk: 28,
          targetSdk: 36,
          yes: true,
          force: true
        })
      );

      const createdDir = join(tempRoot, 'newcliapp');
      assert.strictEqual(await exists(join(createdDir, 'app/build.gradle.kts')), true);
      assert.strictEqual(await exists(join(createdDir, '.gitignore')), false);
      assert.strictEqual(await exists(join(createdDir, 'README.md')), false);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  await t.test('createKmpCommand and kotlinMultiplatformPlugin should scaffold cross-platform KMP project', async () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'andrud-cli-kmp-'));
    try {
      assert.strictEqual(kotlinMultiplatformPlugin.id, 'kotlin-multiplatform');
      assert.ok(
        kotlinMultiplatformPlugin.gradlePlugins.some(
          (p) => p.id === 'org.jetbrains.kotlin.multiplatform'
        )
      );

      await captureConsoleOutput(() =>
        createKmpCommand('CrossPlatformApp', {
          package: 'com.example.crossplatform',
          directory: tempRoot,
          platforms: 'android,ios,desktop',
          yes: true,
          force: true
        })
      );

      const createdDir = join(tempRoot, 'crossplatformapp');
      assert.strictEqual(await exists(join(createdDir, 'project.yaml')), true);
      assert.strictEqual(await exists(join(createdDir, 'libs.versions.toml')), true);
      assert.strictEqual(await exists(join(createdDir, 'kotlin')), true);
      assert.strictEqual(await exists(join(createdDir, 'kotlin.bat')), true);
      assert.strictEqual(await exists(join(createdDir, 'shared/module.yaml')), true);
      assert.strictEqual(await exists(join(createdDir, 'shared/src/App.kt')), true);
      assert.strictEqual(await exists(join(createdDir, 'shared/src/Platform.kt')), true);
      assert.strictEqual(await exists(join(createdDir, 'shared/src/Greeting.kt')), true);
      assert.strictEqual(await exists(join(createdDir, 'shared/test/PlatformTest.kt')), true);
      assert.strictEqual(await exists(join(createdDir, 'androidApp/module.yaml')), true);
      assert.strictEqual(await exists(join(createdDir, 'androidApp/src/MainActivity.kt')), true);
      assert.strictEqual(await exists(join(createdDir, 'desktopApp/module.yaml')), true);
      assert.strictEqual(await exists(join(createdDir, 'desktopApp/src/main.kt')), true);
      assert.strictEqual(await exists(join(createdDir, 'iosApp/module.yaml')), true);
      assert.strictEqual(await exists(join(createdDir, 'iosApp/src/ViewController.kt')), true);
      // wasmJs was not requested in platforms: 'android,ios,desktop'
      assert.strictEqual(await exists(join(createdDir, 'webApp/module.yaml')), false);
      assert.strictEqual(
        await exists(join(createdDir, 'shared/src@wasmJs/Platform.wasmJs.kt')),
        false
      );
      // Ensure single-platform Android app/ directory is not generated
      assert.strictEqual(await exists(join(createdDir, 'app')), false);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  await t.test('createListCommand and createInfoCommand should output valid JSON including KMP', async () => {
    const listOutput = await captureConsoleOutput(() =>
      createListCommand({ json: true, search: 'kotlin' })
    );
    const parsedList = JSON.parse(listOutput.join('\n'));
    assert.strictEqual(Array.isArray(parsedList), true);
    assert.strictEqual(parsedList.length, 4);

    const infoOutput = await captureConsoleOutput(() =>
      createInfoCommand('kotlin-multiplatform', { json: true })
    );
    const parsedInfo = JSON.parse(infoOutput.join('\n'));
    assert.strictEqual(parsedInfo.id, 'kotlin-multiplatform');
    assert.deepStrictEqual(parsedInfo.platforms, ['android', 'ios', 'desktop', 'wasmJs']);
  });

  await t.test('createDoctorCommand should return valid environment diagnostic JSON', async () => {
    const doctorOutput = await captureConsoleOutput(() =>
      createDoctorCommand({ json: true })
    );
    const parsedDoctor = JSON.parse(doctorOutput.join('\n'));
    assert.strictEqual(parsedDoctor.version, '1.0.6');
    assert.strictEqual(Array.isArray(parsedDoctor.checks), true);
    assert.ok(parsedDoctor.checks.some((c: { name: string }) => c.name === 'Node.js Runtime'));
  });
});
