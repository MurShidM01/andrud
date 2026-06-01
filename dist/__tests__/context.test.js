/**
 * Test suite for context builder
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { buildDefaultProjectContext, buildTemplateContext, validateContext } from '../core/context.js';
test('Context - Build Default Context', async (t) => {
    await t.test('should create valid default context', () => {
        const context = buildDefaultProjectContext('MyApp', 'com.example.myapp', './my-project', 'kotlin-compose', { git: true, readme: true });
        assert.strictEqual(context.appName, 'MyApp');
        assert.strictEqual(context.packageName, 'com.example.myapp');
        assert.strictEqual(context.template, 'kotlin-compose');
        assert.strictEqual(context.language, 'kotlin');
        assert.strictEqual(context.uiFramework, 'compose');
    });
    await t.test('should set default features', () => {
        const context = buildDefaultProjectContext('MyApp', 'com.example.myapp', './my-project', 'kotlin-xml');
        assert.strictEqual(context.git, true);
        assert.strictEqual(context.readme, true);
        assert.strictEqual(context.androidX, true);
    });
});
test('Context - Build Template Context', async (t) => {
    await t.test('should build full template context', () => {
        const baseContext = buildDefaultProjectContext('MyApp', 'com.example.myapp', './my-project', 'kotlin-compose');
        const context = buildTemplateContext({
            appName: baseContext.appName,
            packageName: baseContext.packageName,
            projectDirectory: baseContext.projectDirectory,
            template: baseContext.template,
            uiFramework: baseContext.uiFramework,
            language: baseContext.language,
            android: baseContext.android,
            gradle: baseContext.gradle,
            features: baseContext
        });
        assert.ok(context.appNameCamel);
        assert.ok(context.appNamePascal);
        assert.ok(context.appNameKebab);
        assert.ok(context.appNameSnake);
        assert.ok(context.packagePath);
        assert.ok(context.year);
        assert.ok(context.generatorVersion);
    });
    await t.test('should generate correct app name transformations', () => {
        const baseContext = buildDefaultProjectContext('MyAwesomeApp', 'com.example.myapp', './my-project', 'kotlin-compose');
        const context = buildTemplateContext({
            appName: baseContext.appName,
            packageName: baseContext.packageName,
            projectDirectory: baseContext.projectDirectory,
            template: baseContext.template,
            uiFramework: baseContext.uiFramework,
            language: baseContext.language,
            android: baseContext.android,
            gradle: baseContext.gradle,
            features: baseContext
        });
        assert.ok(context.appNamePascal.includes('Awesome'));
        assert.ok(context.packagePath.includes('/'));
    });
});
test('Context - Validate Context', async (t) => {
    await t.test('should accept valid context', () => {
        const baseContext = buildDefaultProjectContext('MyApp', 'com.example.myapp', './my-project', 'kotlin-compose');
        const result = validateContext(baseContext);
        assert.strictEqual(result.valid, true);
    });
    await t.test('should reject context with missing appName', () => {
        const result = validateContext({
            appName: '',
            packageName: 'com.example.myapp',
            template: 'kotlin-compose'
        });
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.length > 0);
    });
    await t.test('should reject context with missing packageName', () => {
        const result = validateContext({
            appName: 'MyApp',
            packageName: '',
            template: 'kotlin-compose'
        });
        assert.strictEqual(result.valid, false);
    });
});
//# sourceMappingURL=context.test.js.map