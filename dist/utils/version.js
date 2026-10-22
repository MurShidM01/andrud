/**
 * Package version utility - single source of truth from package.json
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const FALLBACK_VERSION = '1.0.6';
let cachedVersion;
/**
 * Retrieve the CLI/generator version from package.json
 */
export function getPackageVersion() {
    if (cachedVersion) {
        return cachedVersion;
    }
    try {
        const currentDir = dirname(fileURLToPath(import.meta.url));
        const pkgPath = join(currentDir, '../../package.json');
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        cachedVersion = pkg.version || FALLBACK_VERSION;
        return cachedVersion;
    }
    catch {
        return FALLBACK_VERSION;
    }
}
//# sourceMappingURL=version.js.map