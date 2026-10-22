/**
 * Test suite for context builder
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  buildDefaultProjectContext,
  buildTemplateContext,
  validateContext
} from '../core/context.js';
import type { TemplateType } from '../core/types.js';

test('Context - Build Default Context', async (t) => {
  await t.test('should create valid default context', () => {
    const context = buildDefaultProjectContext(
      'MyApp',
      'com.example.myapp',
      './my-project',
      'kotlin-compose' as TemplateType,
      { git: true, readme: true }
    );

    assert.strictEqual(context.appName, 'MyApp');
    assert.strictEqual(context.packageName, 'com.example.myapp');
    assert.strictEqual(context.template, 'kotlin-compose');
    assert.strictEqual(context.language, 'kotlin');
    assert.strictEqual(context.uiFramework, 'compose');
  });

  await t.test('should set default features', () => {
    const context = buildDefaultProjectContext(
      'MyApp',
      'com.example.myapp',
      './my-project',
      'kotlin-xml' as TemplateType
    );

    assert.strictEqual(context.git, true);
    assert.strictEqual(context.readme, true);
    assert.strictEqual(context.androidX, true);
  });

  await t.test('should configure native-cpp template with NDK settings', () => {
    const context = buildDefaultProjectContext(
      'NativeGame',
      'com.example.nativegame',
      './native-game',
      'native-cpp'
    );

    assert.ok(context.nativeCpp);
    assert.strictEqual(context.nativeCpp?.cppStandard, 'c++17');
    assert.ok(Array.isArray(context.nativeCpp?.abiFilters));
  });
});

test('Context - Build Template Context', async (t) => {
  await t.test('should build full template context directly from baseContext', () => {
    const baseContext = buildDefaultProjectContext(
      'MyApp',
      'com.example.myapp',
      './my-project',
      'kotlin-compose' as TemplateType
    );

    const context = buildTemplateContext(baseContext);

    assert.ok(context.appNameCamel);
    assert.ok(context.appNamePascal);
    assert.ok(context.appNameKebab);
    assert.ok(context.appNameSnake);
    assert.ok(context.packagePath);
    assert.ok(context.year);
    assert.ok(context.generatorVersion);
  });

  await t.test('should generate correct app name transformations', () => {
    const baseContext = buildDefaultProjectContext(
      'My_Awesome_App',
      'com.example.myapp',
      './my-project',
      'kotlin-compose' as TemplateType
    );

    const context = buildTemplateContext(baseContext);

    assert.strictEqual(context.appNamePascal, 'MyAwesomeApp');
    assert.strictEqual(context.appNameCamel, 'myAwesomeApp');
    assert.strictEqual(context.packagePath, 'com/example/myapp');
  });
});

test('Context - Validate Context', async (t) => {
  await t.test('should accept valid context', () => {
    const baseContext = buildDefaultProjectContext(
      'MyApp',
      'com.example.myapp',
      './my-project',
      'kotlin-compose' as TemplateType
    );

    const result = validateContext(baseContext);
    assert.strictEqual(result.valid, true);
  });

  await t.test('should reject context with missing appName', () => {
    const result = validateContext({
      appName: '',
      packageName: 'com.example.myapp',
      template: 'kotlin-compose' as TemplateType
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length > 0);
  });

  await t.test('should reject context with missing packageName', () => {
    const result = validateContext({
      appName: 'MyApp',
      packageName: '',
      template: 'kotlin-compose' as TemplateType
    });

    assert.strictEqual(result.valid, false);
  });

  await t.test('should reject context where minSdk > targetSdk', () => {
    const baseContext = buildDefaultProjectContext(
      'MyApp',
      'com.example.myapp',
      './my-project',
      'kotlin-compose',
      {},
      36,
      31
    );

    const result = validateContext(baseContext);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('minSdk')));
  });
});
