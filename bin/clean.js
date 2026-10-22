#!/usr/bin/env node

/**
 * Build clean & git-global-install preparation helper
 *
 * - In local development (`node_modules/typescript` present): cleans `dist/` before `tsc` runs.
 * - During `npm install -g git+https://...` (where npm v10's `pacote` spawns a child `npm install`
 *   inside a `git-clone*` temp dir inheriting `npm_config_global=true`): preserves pre-built `dist/`,
 *   provides a local `tsc` passthrough shim when `typescript` was omitted by global mode, and ensures
 *   the global module directory is a real directory rather than a dangling symlink to cacache's temp dir.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const tsBinPath = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');
const hasLocalTypeScript = fs.existsSync(tsBinPath);
const isTempGitClone =
  path.basename(rootDir).startsWith('git-clone') ||
  process.env.npm_config_global === 'true';

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

function mergeDirContents(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    try {
      if (fs.existsSync(destPath)) {
        const stat = fs.lstatSync(srcPath);
        if (stat.isDirectory()) {
          mergeDirContents(srcPath, destPath);
          fs.rmSync(srcPath, { recursive: true, force: true });
          continue;
        }
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      fs.renameSync(srcPath, destPath);
    } catch {
      try {
        fs.cpSync(srcPath, destPath, { recursive: true, force: true });
        fs.rmSync(srcPath, { recursive: true, force: true });
      } catch {
        // Ignore transient concurrent extraction races
      }
    }
  }
}

if (hasLocalTypeScript) {
  // Normal local development build: clean dist/ so tsc performs a fresh build
  fs.rmSync(path.join(rootDir, 'dist'), { recursive: true, force: true });
} else if (isTempGitClone) {
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

  if (path.basename(rootDir).startsWith('git-clone')) {
    for (const globalModules of getGlobalNodeModulesDirs()) {
      const pkgPath = path.join(globalModules, 'andrud');
      const savedDepsDir = path.join(globalModules, '.andrud-deps-staging');

      // Rescue any dependencies from retired `.andrud-*` directories before child npm deletes them
      try {
        for (const entry of fs.readdirSync(globalModules)) {
          if (entry.startsWith('.andrud-') && entry !== '.andrud-deps-staging') {
            const retiredNodeModules = path.join(globalModules, entry, 'node_modules');
            if (fs.existsSync(retiredNodeModules)) {
              mergeDirContents(retiredNodeModules, savedDepsDir);
            }
          }
        }
      } catch {
        // Ignore permission or read errors
      }

      // During DirFetcher's prepare step (`npm_package_resolved` is set), replace the symlink
      // to the temp git-clone directory with a real directory and restore staged node_modules.
      if (process.env.npm_package_resolved) {
        try {
          const stat = fs.lstatSync(pkgPath);
          if (stat.isSymbolicLink()) {
            const cloneNodeModules = path.join(rootDir, 'node_modules');
            if (fs.existsSync(cloneNodeModules)) {
              for (const entry of fs.readdirSync(cloneNodeModules)) {
                if (entry === '.bin') continue;
                mergeDirContents(
                  path.join(cloneNodeModules, entry),
                  path.join(savedDepsDir, entry)
                );
              }
            }

            fs.unlinkSync(pkgPath);
            fs.mkdirSync(pkgPath, { recursive: true });

            if (fs.existsSync(savedDepsDir)) {
              mergeDirContents(savedDepsDir, path.join(pkgPath, 'node_modules'));
              fs.rmSync(savedDepsDir, { recursive: true, force: true });
            }
          }
        } catch {
          // Ignore if pkgPath does not exist yet
        }
      }
    }
  }
}
