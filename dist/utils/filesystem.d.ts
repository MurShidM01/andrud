/**
 * File system utilities using fs-extra
 */
export declare function exists(path: string): Promise<boolean>;
export declare function isDirectory(path: string): Promise<boolean>;
export declare function isFile(path: string): Promise<boolean>;
export declare function readFile(path: string): Promise<string>;
export declare function writeFile(path: string, content: string): Promise<void>;
export declare function readJson<T = unknown>(path: string): Promise<T>;
export declare function writeJson(path: string, data: unknown, spaces?: number): Promise<void>;
export declare function copyFile(source: string, destination: string): Promise<void>;
export declare function moveFile(source: string, destination: string): Promise<void>;
export declare function removeFile(path: string): Promise<void>;
export declare function createDirectory(path: string): Promise<void>;
export declare function removeDirectory(path: string): Promise<void>;
export declare function copyDirectory(source: string, destination: string): Promise<void>;
export declare function ensureDirectory(path: string): Promise<void>;
export declare function ensureFile(path: string): Promise<void>;
export declare function getAbsolutePath(path: string): string;
export declare function normalizePath(path: string): string;
export declare function joinPath(...paths: string[]): string;
export declare function dirnamePath(path: string): string;
export declare function basenamePath(path: string, ext?: string): string;
export declare function extnamePath(path: string): string;
export declare function relativePath(from: string, to: string): string;
export declare function getCurrentWorkingDirectory(): string;
export declare function getPackageRoot(): string;
export declare function listFiles(directory: string, extensions?: string[]): Promise<string[]>;
export declare function readDirectory(directory: string): Promise<string[]>;
/**
 * Write file with timeout protection
 */
export declare function writeFileWithTimeout(path: string, content: string, timeoutMs?: number): Promise<void>;
/**
 * Create directory with timeout protection
 */
export declare function createDirectoryWithTimeout(path: string, timeoutMs?: number): Promise<void>;
//# sourceMappingURL=filesystem.d.ts.map