/**
 * Test suite for validation utilities
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { validateAppName, validatePackageNameInput, validateDirectoryPath, validateAndroidMinSdk, validateAndroidTargetSdk, deriveValidAppName, deriveDefaultPackageName, sanitizePackageName, camelCase, pascalCase, kebabCase, snakeCase, dotCase } from '../utils/validation.js';
test('Validation - App Name', async (t) => {
    await t.test('should accept valid app name', () => {
        const result = validateAppName('MyAwesomeApp');
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.normalized, 'MyAwesomeApp');
    });
    await t.test('should reject app name starting with number', () => {
        const result = validateAppName('1App');
        assert.strictEqual(result.valid, false);
        assert.ok(result.errors.length > 0);
    });
    await t.test('should reject app name with spaces or hyphens', () => {
        assert.strictEqual(validateAppName('My App').valid, false);
        assert.strictEqual(validateAppName('My-App').valid, false);
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
    await t.test('should reject reserved prefixes', () => {
        assert.strictEqual(validatePackageNameInput('android.example.app').valid, false);
        assert.strictEqual(validatePackageNameInput('kotlin.example.app').valid, false);
        assert.strictEqual(validatePackageNameInput('java.example.app').valid, false);
        assert.strictEqual(validatePackageNameInput('com.android.myapp').valid, false);
    });
    await t.test('should reject reserved Java/Kotlin keywords in segments', () => {
        assert.strictEqual(validatePackageNameInput('com.example.int').valid, false);
        assert.strictEqual(validatePackageNameInput('com.class.myapp').valid, false);
        assert.strictEqual(validatePackageNameInput('com.example.fun').valid, false);
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
    await t.test('should sanitize arbitrary strings into valid package names', () => {
        const sanitized = sanitizePackageName('My__Cool--App');
        assert.strictEqual(validatePackageNameInput(sanitized).valid, true);
    });
});
test('Validation - Directory Path & SDK Levels', async (t) => {
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
    await t.test('should accept Windows drive paths', () => {
        const result = validateDirectoryPath('D:\\Projects\\Android');
        assert.strictEqual(result.valid, true);
    });
    await t.test('should validate min and target SDK integers strictly', () => {
        assert.strictEqual(validateAndroidMinSdk(31).valid, true);
        assert.strictEqual(validateAndroidMinSdk('24abc').valid, false);
        assert.strictEqual(validateAndroidMinSdk(15).valid, false);
        assert.strictEqual(validateAndroidTargetSdk(36).valid, true);
        assert.strictEqual(validateAndroidTargetSdk('36xyz').valid, false);
    });
});
test('String Case Transformations & Helpers', async (t) => {
    await t.test('camelCase should transform spaces, underscores, and hyphens', () => {
        assert.strictEqual(camelCase('my awesome app'), 'myAwesomeApp');
        assert.strictEqual(camelCase('my_awesome_app'), 'myAwesomeApp');
        assert.strictEqual(camelCase('my-awesome-app'), 'myAwesomeApp');
        assert.strictEqual(camelCase('MyAwesomeApp'), 'myAwesomeApp');
    });
    await t.test('pascalCase should transform spaces, underscores, and hyphens', () => {
        assert.strictEqual(pascalCase('my awesome app'), 'MyAwesomeApp');
        assert.strictEqual(pascalCase('my_awesome_app'), 'MyAwesomeApp');
        assert.strictEqual(pascalCase('my-awesome-app'), 'MyAwesomeApp');
        assert.strictEqual(pascalCase('MyAwesomeApp'), 'MyAwesomeApp');
    });
    await t.test('kebabCase should transform correctly', () => {
        assert.strictEqual(kebabCase('my awesome app'), 'my-awesome-app');
        assert.strictEqual(kebabCase('My_Awesome_App'), 'my-awesome-app');
        assert.strictEqual(kebabCase('MyAwesomeApp'), 'my-awesome-app');
    });
    await t.test('snakeCase should transform correctly', () => {
        assert.strictEqual(snakeCase('my awesome app'), 'my_awesome_app');
        assert.strictEqual(snakeCase('My-Awesome-App'), 'my_awesome_app');
        assert.strictEqual(snakeCase('MyAwesomeApp'), 'my_awesome_app');
    });
    await t.test('dotCase should transform correctly', () => {
        assert.strictEqual(dotCase('My Awesome App'), 'my.awesome.app');
    });
    await t.test('deriveValidAppName and deriveDefaultPackageName should handle edge cases', () => {
        assert.strictEqual(deriveValidAppName('my-android-project'), 'MyAndroidProject');
        assert.strictEqual(deriveValidAppName('123-app'), 'App123App');
        assert.strictEqual(deriveDefaultPackageName('int'), 'com.example.intapp');
    });
});
//# sourceMappingURL=validation.test.js.map