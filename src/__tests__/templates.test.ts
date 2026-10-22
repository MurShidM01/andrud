/**
 * Test suite for template registry and search
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  getAllTemplates,
  getTemplateMetadata,
  searchTemplates,
  getTemplatesByCategory,
  getTemplatePreview
} from '../templates/index.js';

test('Templates - Registry & Search', async (t) => {
  await t.test('should return all 5 templates including kotlin-multiplatform', () => {
    const templates = getAllTemplates();
    assert.strictEqual(templates.length, 5);
    assert.ok(templates.some((tpl) => tpl.id === 'kotlin-multiplatform'));
  });

  await t.test('should retrieve template metadata by id and alias', () => {
    const meta = getTemplateMetadata('kotlin-compose');
    assert.ok(meta);
    assert.strictEqual(meta?.language, 'kotlin');
    assert.strictEqual(meta?.uiFramework, 'compose');

    const kmpMeta = getTemplateMetadata('kmp');
    assert.ok(kmpMeta);
    assert.strictEqual(kmpMeta?.id, 'kotlin-multiplatform');
    assert.deepStrictEqual(kmpMeta?.platforms, ['android', 'ios', 'desktop', 'wasmJs']);
  });

  await t.test('should search templates by keyword', () => {
    const kmpResults = searchTemplates('multiplatform');
    assert.strictEqual(kmpResults.length, 1);
    assert.strictEqual(kmpResults[0]?.id, 'kotlin-multiplatform');

    const ndkResults = searchTemplates('cmake');
    assert.strictEqual(ndkResults.length, 1);
    assert.strictEqual(ndkResults[0]?.id, 'native-cpp');
  });

  await t.test('should filter templates by category', () => {
    assert.strictEqual(getTemplatesByCategory('kotlin').length, 4);
    assert.strictEqual(getTemplatesByCategory('java').length, 1);
    assert.strictEqual(getTemplatesByCategory('native').length, 1);
    assert.strictEqual(getTemplatesByCategory('multiplatform').length, 1);
  });

  await t.test('should return code preview for every template', () => {
    for (const template of getAllTemplates()) {
      const preview = getTemplatePreview(template.id);
      assert.ok(preview && preview.length > 0);
    }
  });
});
