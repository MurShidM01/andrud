/**
 * Test suite for validation utilities
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { validateAppName, validatePackageNameInput, validateDirectoryPath, camelCase, pascalCase, kebabCase, snakeCase } from '../utils/validation.js';
test('Validation - App Name', async (t) => {
    await t.test('should accept valid app name', () => {
        const result = validateAppName('MyAwesomeApp');
        assert.strictEqual(result.valid, true);
    });
    await t.test('should reject app name starting with number', () => {
        const result = validateAppName('1App');
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.length > 0);
    });
    await t.test('should reject app name with spaces', () => {
        const result = validateAppName('My App');
        assert.strictEqual(result.valid, false);
    });
    await t.test('should reject empty app name', () => {
        const result = validateAppName('');
        assert.strictEqual(result.valid, false);
    });
});
test('Validation - Package Name', async (t) => {
    await t.test('should accept valid package name', () => {
        const result = validatePackageNameInput('com.example.myapp');
        assert.strictEqual(result.valid, true);
    });
    await t.test('should reject reserved prefix android', () => {
        const result = validatePackageNameInput('android.example.app');
        assert.strictEqual(result.valid, false);
    });
    await t.test('should reject reserved prefix kotlin', () => {
        const result = validatePackageNameInput('kotlin.example.app');
        assert.strictEqual(result.valid, false);
    });
    await t.test('should reject package with single segment', () => {
        const result = validatePackageNameInput('myapp');
        assert.strictEqual(result.valid, false);
    });
    await t.test('should warn on generic com.example prefix', () => {
        const result = validatePackageNameInput('com.example.app');
        assert.strictEqual(result.valid, true);
        assert.ok(result.warnings && result.warnings.length > 0);
    });
});
test('Validation - Directory Path', async (t) => {
    await t.test('should accept valid directory path', () => {
        const result = validateDirectoryPath('./my-project');
        assert.strictEqual(result.valid, true);
    });
    await t.test('should reject empty directory path', () => {
        const result = validateDirectoryPath('');
        assert.strictEqual(result.valid, false);
    });
    await t.test('should reject directory traversal', () => {
        const result = validateDirectoryPath('../../../etc/passwd');
        assert.strictEqual(result.valid, false);
    });
});
test('String Case Transformations', async (t) => {
    await t.test('camelCase should transform correctly', () => {
        const result = camelCase('my awesome app');
        assert.strictEqual(result, 'myAwesomeApp');
    });
    await t.test('pascalCase should transform correctly', () => {
        const result = pascalCase('my awesome app');
        assert.strictEqual(result, 'MyAwesomeApp');
    });
    await t.test('kebabCase should transform correctly', () => {
        const result = kebabCase('my awesome app');
        assert.strictEqual(result, 'my-awesome-app');
    });
    await t.test('snakeCase should transform correctly', () => {
        const result = snakeCase('my awesome app');
        assert.strictEqual(result, 'my_awesome_app');
    });
});
//# sourceMappingURL=validation.test.js.map