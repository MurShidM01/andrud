/**
 * File system utilities using fs-extra
 */
import fse from 'fs-extra';
import { resolve, join, dirname, basename, extname, relative, normalize, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
// Check if path exists
export async function exists(path) {
    try {
        await fse.access(path);
        return true;
    }
    catch {
        return false;
    }
}
// Check if path is a directory
export async function isDirectory(path) {
    try {
        const stats = await fse.stat(path);
        return stats.isDirectory();
    }
    catch {
        return false;
    }
}
// Check if path is a file
export async function isFile(path) {
    try {
        const stats = await fse.stat(path);
        return stats.isFile();
    }
    catch {
        return false;
    }
}
// Read file content
export async function readFile(path) {
    return fse.readFile(path, 'utf-8');
}
// Write file content
export async function writeFile(path, content) {
    await fse.writeFile(path, content, 'utf-8');
}
// Read JSON file
export async function readJson(path) {
    return fse.readJson(path);
}
// Write JSON file
export async function writeJson(path, data, spaces = 2) {
    await fse.writeJson(path, data, { spaces });
}
// Copy file
export async function copyFile(source, destination) {
    await fse.copy(source, destination);
}
// Move file
export async function moveFile(source, destination) {
    await fse.move(source, destination);
}
// Remove file
export async function removeFile(path) {
    try {
        await fse.remove(path);
    }
    catch {
        // Ignore errors if file doesn't exist
    }
}
// Create directory
export async function createDirectory(path) {
    await fse.mkdir(path, { recursive: true });
}
// Remove directory
export async function removeDirectory(path) {
    try {
        await fse.remove(path);
    }
    catch {
        // Ignore errors if directory doesn't exist
    }
}
// Copy directory
export async function copyDirectory(source, destination) {
    await fse.copy(source, destination);
}
// Ensure directory exists
export async function ensureDirectory(path) {
    await fse.ensureDir(path);
}
// Ensure file exists (creates empty file if it doesn't)
export async function ensureFile(path) {
    await fse.ensureFile(path);
}
// Get absolute path
export function getAbsolutePath(path) {
    if (isAbsolute(path)) {
        return normalize(path);
    }
    return resolve(getCurrentWorkingDirectory(), path);
}
// Normalize path
export function normalizePath(path) {
    return normalize(path);
}
// Join path segments
export function joinPath(...paths) {
    return join(...paths);
}
// Get directory name
export function dirnamePath(path) {
    return dirname(path);
}
// Get base name
export function basenamePath(path, ext) {
    return basename(path, ext);
}
// Get extension
export function extnamePath(path) {
    return extname(path);
}
// Get relative path
export function relativePath(from, to) {
    return relative(from, to);
}
// Get current working directory
export function getCurrentWorkingDirectory() {
    return process.cwd();
}
// Get package root directory
export function getPackageRoot() {
    const currentFile = import.meta.url;
    if (currentFile.startsWith('file://')) {
        const currentDir = fileURLToPath(new URL('.', currentFile));
        return resolve(currentDir, '..');
    }
    return getCurrentWorkingDirectory();
}
// List files in directory
export async function listFiles(directory, extensions) {
    const files = [];
    async function walk(dir) {
        const entries = await fse.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath);
            }
            else if (entry.isFile()) {
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
export async function readDirectory(directory) {
    return fse.readdir(directory);
}
/**
 * Write file with timeout protection
 */
export async function writeFileWithTimeout(path, content, timeoutMs = 5000) {
    return Promise.race([
        writeFile(path, content),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Write operation timeout after ${timeoutMs}ms`)), timeoutMs))
    ]);
}
/**
 * Create directory with timeout protection
 */
export async function createDirectoryWithTimeout(path, timeoutMs = 5000) {
    return Promise.race([
        createDirectory(path),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Create directory operation timeout after ${timeoutMs}ms`)), timeoutMs))
    ]);
}
//# sourceMappingURL=filesystem.js.map