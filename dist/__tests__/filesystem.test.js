/**
 * Test suite for filesystem path helpers
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { sep } from 'node:path';
import { resolveProjectDirectory } from '../utils/filesystem.js';
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
});
//# sourceMappingURL=filesystem.test.js.map