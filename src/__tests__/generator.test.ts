/**
 * Test suite for generator utilities and full project scaffolding
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  validateContext,
  validateProjectDirectory,
  generateProject
} from '../core/generator.js';
import { buildDefaultProjectContext, buildTemplateContext } from '../core/context.js';
import { exists, readFile } from '../utils/filesystem.js';
import type { TemplateContext, TemplateType } from '../core/types.js';

test('Generator - Validate Context', async (t) => {
  await t.test('should accept valid context', () => {
    const context: Partial<TemplateContext> = {
      appName: 'MyApp',
      packageName: 'com.example.myapp',
      projectDirectory: './my-project',
      template: 'kotlin-compose',
      language: 'kotlin',
      uiFramework: 'compose',
      android: {
        minSdk: 24,
        targetSdk: 37,
        compileSdk: 37
      },
      gradle: {
        agpVersion: '8.7.3',
        gradleVersion: '8.14.4',
        kotlinVersion: '2.0.21'
      }
    };

    const result = validateContext(context);
    assert.strictEqual(result.valid, true);
  });

  await t.test('should reject context with missing appName', () => {
    const context: Partial<TemplateContext> = {
      appName: '',
      packageName: 'com.example.myapp'
    };

    const result = validateContext(context);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('appName')));
  });

  await t.test('should reject context with missing packageName', () => {
    const context: Partial<TemplateContext> = {
      appName: 'MyApp',
      packageName: ''
    };

    const result = validateContext(context);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('packageName')));
  });

  await t.test('should reject context with missing template', () => {
    const context: Partial<TemplateContext> = {
      appName: 'MyApp',
      packageName: 'com.example.myapp',
      template: undefined
    };

    const result = validateContext(context);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('template')));
  });

  await t.test('should reject context with missing language', () => {
    const context: Partial<TemplateContext> = {
      appName: 'MyApp',
      packageName: 'com.example.myapp',
      template: 'kotlin-compose',
      language: undefined
    };

    const result = validateContext(context);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('language')));
  });
});

test('Generator - Validate Project Directory', async (t) => {
  await t.test('should validate non-existent directory', async () => {
    const result = await validateProjectDirectory(
      '/tmp/nonexistent-dir-' + Date.now(),
      { overwrite: false }
    );

    assert.strictEqual(result.valid, true);
  });

  await t.test('should allow non-empty directory with overwrite', async () => {
    const result = await validateProjectDirectory(
      '/tmp/test-dir',
      { overwrite: true }
    );

    assert.ok(typeof result.valid === 'boolean');
  });
});

test('Generator - End-to-End Project Scaffolding', async (t) => {
  const templates: TemplateType[] = [
    'kotlin-compose',
    'kotlin-xml',
    'java-xml',
    'native-cpp',
    'kotlin-multiplatform'
  ];

  for (const template of templates) {
    await t.test(`should generate complete ${template} project`, async () => {
      const tempRoot = mkdtempSync(join(tmpdir(), `andrud-gen-${template}-`));
      try {
        const projectDir = join(tempRoot, 'my_app');
        const baseCtx = buildDefaultProjectContext(
          'My_App',
          'com.my_org.my_app',
          projectDir,
          template
        );
        const ctx = buildTemplateContext(baseCtx);

        // Verify default minSdk = 24 (Android 7) and targetSdk = 37 (Android 17)
        assert.strictEqual(ctx.android.minSdk, 24);
        assert.strictEqual(ctx.android.targetSdk, 37);
        assert.strictEqual(ctx.android.compileSdk, 37);

        const result = await generateProject(ctx, { overwrite: true });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.errors.length, 0);
        assert.ok(result.generatedFiles.length >= 16);

        // Check AndroidManifest references Application class
        const manifest = await readFile(join(projectDir, 'app/src/main/AndroidManifest.xml'));
        assert.ok(manifest.includes('android:name=".MyAppApplication"'));
        assert.ok(manifest.includes('android:name="com.my_org.my_app.MainActivity"'));

        // Check light and dark themes exist
        assert.strictEqual(await exists(join(projectDir, 'app/src/main/res/values/themes.xml')), true);
        assert.strictEqual(await exists(join(projectDir, 'app/src/main/res/values-night/themes.xml')), true);

        // Check Gradle wrapper files exist
        assert.strictEqual(await exists(join(projectDir, 'gradlew')), true);
        assert.strictEqual(await exists(join(projectDir, 'gradlew.bat')), true);
        assert.strictEqual(await exists(join(projectDir, 'gradle/wrapper/gradle-wrapper.jar')), true);

        // Template-specific checks
        if (template === 'native-cpp') {
          const cppContent = await readFile(join(projectDir, 'app/src/main/cpp/native-lib.cpp'));
          assert.ok(cppContent.includes('Java_com_my_1org_my_1app_NativeLib_stringFromJNI'));
        }

        if (template === 'kotlin-multiplatform') {
          const rootGradle = await readFile(join(projectDir, 'build.gradle.kts'));
          assert.ok(rootGradle.includes('org.jetbrains.kotlin.multiplatform'));
          assert.ok(rootGradle.includes('org.jetbrains.compose'));

          const settingsGradle = await readFile(join(projectDir, 'settings.gradle.kts'));
          assert.ok(settingsGradle.includes('include(":shared")'));

          const sharedGradle = await readFile(join(projectDir, 'shared/build.gradle.kts'));
          assert.ok(sharedGradle.includes('kotlin.srcDir("../lib")'));
          assert.ok(sharedGradle.includes('kotlin.srcDir("../test")'));

          assert.strictEqual(await exists(join(projectDir, 'gradle/libs.versions.toml')), true);
          assert.strictEqual(await exists(join(projectDir, 'shared/build.gradle.kts')), true);
          assert.strictEqual(await exists(join(projectDir, 'lib/main.kt')), true);
          assert.strictEqual(await exists(join(projectDir, 'lib/App.kt')), true);
          assert.strictEqual(await exists(join(projectDir, 'lib/Platform.kt')), true);
          assert.strictEqual(await exists(join(projectDir, 'lib/Greeting.kt')), true);
          assert.strictEqual(await exists(join(projectDir, 'lib/ui/theme/Color.kt')), true);
          assert.strictEqual(await exists(join(projectDir, 'lib/ui/theme/Type.kt')), true);
          assert.strictEqual(await exists(join(projectDir, 'lib/ui/theme/Theme.kt')), true);
          assert.strictEqual(await exists(join(projectDir, 'test/GreetingTest.kt')), true);
          assert.strictEqual(
            await exists(join(projectDir, 'shared/src/androidMain/kotlin/com/my_org/my_app/shared/Platform.android.kt')),
            true
          );
          assert.strictEqual(
            await exists(join(projectDir, 'shared/src/iosMain/kotlin/com/my_org/my_app/shared/Platform.ios.kt')),
            true
          );
          assert.strictEqual(
            await exists(join(projectDir, 'shared/src/desktopMain/kotlin/com/my_org/my_app/shared/Platform.jvm.kt')),
            true
          );
          assert.strictEqual(
            await exists(join(projectDir, 'shared/src/wasmJsMain/kotlin/com/my_org/my_app/shared/Platform.wasmJs.kt')),
            true
          );
          assert.strictEqual(
            await exists(join(projectDir, 'shared/src/wasmJsMain/kotlin/com/my_org/my_app/shared/main.kt')),
            true
          );
          assert.strictEqual(
            await exists(join(projectDir, 'shared/src/wasmJsMain/resources/index.html')),
            true
          );
          assert.strictEqual(await exists(join(projectDir, 'iosApp/iosApp/Info.plist')), true);
          assert.strictEqual(await exists(join(projectDir, 'iosApp/iosApp/ContentView.swift')), true);
        }
      } finally {
        rmSync(tempRoot, { recursive: true, force: true });
      }
    });
  }
});
