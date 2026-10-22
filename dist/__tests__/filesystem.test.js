/**
 * Test suite for filesystem path and file helpers
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { sep, join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolveProjectDirectory, getPackageRoot, exists, writeFileWithTimeout, readFile } from '../utils/filesystem.js';
test('Filesystem - Project Directory Resolution', async (t) => {
    await t.test('should append sanitized app name to absolute Linux parent path', () => {
        const result = resolveProjectDirectory('/tmp/Android-Apps', 'MyApp');
        assert.strictEqual(result, `/tmp/Android-Apps${sep}myapp`);
    });
    await t.test('should not create literal backslash-prefixed project names on POSIX paths', () => {
        const result = resolveProjectDirectory('/tmp/Android-Apps/', 'MyApp');
        assert.ok(!result.includes(`${sep}\\myapp`));
        assert.strictEqual(result, `/tmp/Android-Apps${sep}myapp`);
    });
    await t.test('should treat pasted backslashes as separators on POSIX hosts', () => {
        const result = resolveProjectDirectory('/tmp\\Android-Apps', 'My App');
        assert.strictEqual(result, `/tmp${sep}Android-Apps${sep}my-app`);
    });
    await t.test('should resolve package root containing package.json', async () => {
        const root = getPackageRoot();
        const hasPkgJson = await exists(join(root, 'package.json'));
        assert.strictEqual(hasPkgJson, true);
    });
    await t.test('should write file creating parent directories and clearing timeout', async () => {
        const tempRoot = mkdtempSync(join(tmpdir(), 'andrud-fs-test-'));
        try {
            const targetFile = join(tempRoot, 'nested', 'dir', 'hello.txt');
            await writeFileWithTimeout(targetFile, 'hello world', 2000);
            const content = await readFile(targetFile);
            assert.strictEqual(content, 'hello world');
        }
        finally {
            rmSync(tempRoot, { recursive: true, force: true });
        }
    });
});
//# sourceMappingURL=filesystem.test.js.map