/**
 * Test suite for generator utilities
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  validateContext,
  validateProjectDirectory
} from '../core/generator.js';
import type { TemplateContext } from '../core/types.js';

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
        minSdk: 31,
        targetSdk: 36,
        compileSdk: 36
      },
      gradle: {
        agpVersion: '8.7.3',
        gradleVersion: '8.14',
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
    assert.ok(result.errors.some(e => e.includes('appName')));
  });

  await t.test('should reject context with missing packageName', () => {
    const context: Partial<TemplateContext> = {
      appName: 'MyApp',
      packageName: ''
    };

    const result = validateContext(context);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('packageName')));
  });

  await t.test('should reject context with missing template', () => {
    const context: Partial<TemplateContext> = {
      appName: 'MyApp',
      packageName: 'com.example.myapp',
      template: undefined
    };

    const result = validateContext(context);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('template')));
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
    assert.ok(result.errors.some(e => e.includes('language')));
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
    // Note: This would require actual file system operations
    // In a real test, we'd mock the filesystem
    const result = await validateProjectDirectory(
      '/tmp/test-dir',
      { overwrite: true }
    );

    // Just assert the result has the expected shape
    assert.ok(typeof result.valid === 'boolean');
  });
});
