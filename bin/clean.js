#!/usr/bin/env node

/**
 * Build clean & git-global-install preparation helper
 *
 * - In local development (`node_modules/typescript` present): cleans `dist/` before `tsc` runs.
 * - During `npm install -g git+https://...` (where npm v10's `pacote` spawns a child `npm install`
 *   inside a `git-clone*` temp dir inheriting `npm_config_global=true`):
 *   1. Provides a passthrough `tsc` shim when `typescript` was skipped by global mode.
 *   2. Atomically restores the retired `.andrud-*` global directory back to `andrud` before the
 *      child `npm` deletes `.andrud-*` in `_removeTrash()`, preventing `TAR_ENTRY_ERROR` and
 *      dangling symlinks in `/usr/local/lib/node_modules/andrud` (or nvm/Termux global prefix).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const tsBinPath = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');
const hasLocalTypeScript = fs.existsSync(tsBinPath);
const isGitCloneTemp = path.basename(rootDir).startsWith('git-clone');
const isGlobalPrepare = isGitCloneTemp || process.env.npm_config_global === 'true';

function getGlobalNodeModulesDirs() {
  const candidates = new Set([
    '/usr/local/lib/node_modules',
    '/usr/local/node_modules',
    '/usr/lib/node_modules',
    '/data/data/com.termux/files/usr/lib/node_modules'
  ]);
  const execDir = path.dirname(process.execPath);
  const prefixFromExec = path.resolve(execDir, '..');
  candidates.add(path.join(prefixFromExec, 'lib', 'node_modules'));
  candidates.add(path.join(prefixFromExec, 'node_modules'));

  if (process.env.PREFIX) {
    candidates.add(path.join(process.env.PREFIX, 'lib', 'node_modules'));
    candidates.add(path.join(process.env.PREFIX, 'node_modules'));
  }
  if (process.env.npm_config_prefix) {
    candidates.add(path.join(process.env.npm_config_prefix, 'lib', 'node_modules'));
    candidates.add(path.join(process.env.npm_config_prefix, 'node_modules'));
  }

  return [...candidates].filter((dir) => fs.existsSync(dir));
}

if (hasLocalTypeScript) {
  // Normal local development build: clean dist/ so tsc performs a fresh build
  fs.rmSync(path.join(rootDir, 'dist'), { recursive: true, force: true });
} else if (isGlobalPrepare) {
  // Running inside a git dependency prepare step where devDependencies were skipped
  const binDir = path.join(rootDir, 'node_modules', '.bin');
  fs.mkdirSync(binDir, { recursive: true });

  const unixShim = path.join(binDir, 'tsc');
  const winShim = path.join(binDir, 'tsc.cmd');

  if (!fs.existsSync(unixShim)) {
    fs.writeFileSync(unixShim, '#!/usr/bin/env node\nprocess.exit(0);\n', { mode: 0o755 });
    fs.chmodSync(unixShim, 0o755);
  }
  if (!fs.existsSync(winShim)) {
    fs.writeFileSync(winShim, '@echo off\r\nexit /b 0\r\n');
  }
}

if (isGitCloneTemp) {
  for (const globalModules of getGlobalNodeModulesDirs()) {
    const pkgPath = path.join(globalModules, 'andrud');

    try {
      const stat = fs.lstatSync(pkgPath);
      if (stat.isSymbolicLink()) {
        // Find the retired `.andrud-*` directory where the outer npm's tar.x is extracting
        let retiredDir = null;
        for (const entry of fs.readdirSync(globalModules)) {
          if (entry.startsWith('.andrud-')) {
            const candidate = path.join(globalModules, entry);
            if (fs.lstatSync(candidate).isDirectory()) {
              retiredDir = candidate;
              break;
            }
          }
        }

        // Remove the symlink pointing to cacache's temporary git-clone dir
        fs.unlinkSync(pkgPath);

        if (retiredDir) {
          // Atomically move the retired directory back to `andrud` so active tar.x streams
          // keep their open directory inode, and create an empty placeholder for `_removeTrash()`.
          fs.renameSync(retiredDir, pkgPath);
          fs.mkdirSync(retiredDir, { recursive: true });
        } else {
          fs.mkdirSync(pkgPath, { recursive: true });
        }

        // Copy package.json, bin/, and dist/ so child npm's bin-links step succeeds
        for (const item of ['package.json', 'bin', 'dist']) {
          const src = path.join(rootDir, item);
          const dest = path.join(pkgPath, item);
          if (fs.existsSync(src)) {
            fs.cpSync(src, dest, { recursive: true, force: true });
          }
        }
      }
    } catch {
      // Ignore if pkgPath does not exist in this candidate directory
    }
  }
}
