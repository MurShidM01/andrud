/**
 * File system utilities using fs-extra
 */

import fse from 'fs-extra';
import { resolve, join, dirname, basename, extname, relative, normalize, isAbsolute } from 'path';
import { platform } from 'os';
import { fileURLToPath } from 'url';

// Check if path exists
export async function exists(path: string): Promise<boolean> {
  try {
    await fse.access(path);
    return true;
  } catch {
    return false;
  }
}

// Check if path is a directory
export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await fse.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

// Check if path is a file
export async function isFile(path: string): Promise<boolean> {
  try {
    const stats = await fse.stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

// Read file content
export async function readFile(path: string): Promise<string> {
  return fse.readFile(path, 'utf-8');
}

// Write file content
export async function writeFile(path: string, content: string | Uint8Array): Promise<void> {
  if (typeof content === 'string') {
    await fse.writeFile(path, content, 'utf-8');
  } else {
    await fse.writeFile(path, content);
  }
}

// Read JSON file
export async function readJson<T = unknown>(path: string): Promise<T> {
  return fse.readJson(path) as Promise<T>;
}

// Write JSON file
export async function writeJson(path: string, data: unknown, spaces: number = 2): Promise<void> {
  await fse.writeJson(path, data, { spaces });
}

// Copy file
export async function copyFile(source: string, destination: string): Promise<void> {
  await fse.copy(source, destination);
}

// Move file
export async function moveFile(source: string, destination: string): Promise<void> {
  await fse.move(source, destination);
}

// Remove file
export async function removeFile(path: string): Promise<void> {
  try {
    await fse.remove(path);
  } catch {
    // Ignore errors if file doesn't exist
  }
}

// Create directory
export async function createDirectory(path: string): Promise<void> {
  await fse.mkdir(path, { recursive: true });
}

// Remove directory
export async function removeDirectory(path: string): Promise<void> {
  try {
    await fse.remove(path);
  } catch {
    // Ignore errors if directory doesn't exist
  }
}

// Copy directory
export async function copyDirectory(source: string, destination: string): Promise<void> {
  await fse.copy(source, destination);
}

// Ensure directory exists
export async function ensureDirectory(path: string): Promise<void> {
  await fse.ensureDir(path);
}

// Ensure file exists (creates empty file if it doesn't)
export async function ensureFile(path: string): Promise<void> {
  await fse.ensureFile(path);
}

// Get absolute path
export function getAbsolutePath(path: string): string {
  if (isAbsolute(path)) {
    return normalize(path);
  }
  return resolve(getCurrentWorkingDirectory(), path);
}

// Convert a user-entered base directory into a host-native absolute path.
export function normalizeBaseDirectoryInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (platform() === 'win32') {
    const unixDrivePath = trimmed.match(/^\/([a-zA-Z])\/(.*)$/);
    if (unixDrivePath?.[1] && unixDrivePath[2] !== undefined) {
      return normalize(`${unixDrivePath[1].toUpperCase()}:\\${unixDrivePath[2].replace(/\//g, '\\')}`);
    }
    return isAbsolute(trimmed) ? normalize(trimmed) : resolve(getCurrentWorkingDirectory(), trimmed);
  }

  // On POSIX hosts, backslashes are legal filename characters but users often paste
  // Windows-style separators by accident. Treat them as separators to avoid creating
  // directories with literal "\" in their names.
  const posixLike = trimmed.replace(/\\+/g, '/');
  return isAbsolute(posixLike) ? normalize(posixLike) : resolve(getCurrentWorkingDirectory(), posixLike);
}

export function projectDirectoryName(appName: string): string {
  const name = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return name || 'android-app';
}

// Resolve the final project directory from a user-entered parent/base directory.
export function resolveProjectDirectory(baseDirectory: string, appName: string): string {
  return normalize(join(normalizeBaseDirectoryInput(baseDirectory), projectDirectoryName(appName)));
}

// Normalize path
export function normalizePath(path: string): string {
  return normalize(path);
}

// Join path segments
export function joinPath(...paths: string[]): string {
  return join(...paths);
}

// Get directory name
export function dirnamePath(path: string): string {
  return dirname(path);
}

// Get base name
export function basenamePath(path: string, ext?: string): string {
  return basename(path, ext);
}

// Get extension
export function extnamePath(path: string): string {
  return extname(path);
}

// Get relative path
export function relativePath(from: string, to: string): string {
  return relative(from, to);
}

// Get current working directory
export function getCurrentWorkingDirectory(): string {
  return process.cwd();
}

// Get package root directory
export function getPackageRoot(): string {
  const currentFile = import.meta.url;
  if (currentFile.startsWith('file://')) {
    const currentDir = fileURLToPath(new URL('.', currentFile));
    return resolve(currentDir, '..');
  }
  return getCurrentWorkingDirectory();
}

// List files in directory
export async function listFiles(directory: string, extensions?: string[]): Promise<string[]> {
  const files: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fse.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        if (!extensions || extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
  }

  await walk(directory);
  return files;
}

// Read directory contents
export async function readDirectory(directory: string): Promise<string[]> {
  return fse.readdir(directory);
}

/**
 * Write file with timeout protection
 */
export async function writeFileWithTimeout(
  path: string,
  content: string | Uint8Array,
  timeoutMs: number = 5000
): Promise<void> {
  return Promise.race([
    writeFile(path, content),
    new Promise<void>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Write operation timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    )
  ]);
}

/**
 * Create directory with timeout protection
 */
export async function createDirectoryWithTimeout(
  path: string,
  timeoutMs: number = 5000
): Promise<void> {
  return Promise.race([
    createDirectory(path),
    new Promise<void>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Create directory operation timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    )
  ]);
}