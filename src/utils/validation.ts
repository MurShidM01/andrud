/**
 * Validation utilities for app names, package names, SDK versions, and paths
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AppNameValidation extends ValidationResult {
  normalized?: string;
}

export interface PackageNameValidation extends ValidationResult {
  suggestions?: string[];
}

export interface DirectoryPathValidation extends ValidationResult {
  normalized?: string;
}

/**
 * Reserved Java and Kotlin keywords that cannot be used as package segments
 */
const JAVA_KOTLIN_RESERVED_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'false', 'final', 'finally', 'float', 'for', 'goto', 'if',
  'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
  'new', 'null', 'package', 'private', 'protected', 'public', 'return',
  'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
  'throw', 'throws', 'transient', 'true', 'try', 'void', 'volatile', 'while',
  'as', 'fun', 'in', 'is', 'object', 'typealias', 'typeof', 'val', 'var', 'when'
]);

/**
 * Reserved package prefixes disallowed by Android/Java conventions
 */
const RESERVED_PACKAGE_PREFIXES = [
  'java',
  'javax',
  'android',
  'androidx',
  'kotlin',
  'kotlinx',
  'com.android',
  'com.google.android'
];

// Validate app name
export function validateAppName(name: string): AppNameValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('App name cannot be empty');
    return { valid: false, errors, warnings };
  }

  const trimmed = name.trim();

  // Check for invalid characters
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmed)) {
    if (trimmed.includes('-')) {
      errors.push('App name cannot contain hyphens. Use underscores instead (e.g., My_Awesome_App)');
    } else if (trimmed.includes(' ')) {
      errors.push('App name cannot contain spaces. Use underscores instead (e.g., My_Awesome_App)');
    } else if (/^[0-9]/.test(trimmed)) {
      errors.push('App name must start with a letter');
    } else {
      errors.push('App name can only contain letters, numbers, and underscores');
    }
    return { valid: false, errors, warnings };
  }

  // Warnings for reserved words
  const reservedWords = ['android', 'app', 'application', 'com', 'org', 'net', 'io', 'java', 'kotlin'];
  if (reservedWords.includes(trimmed.toLowerCase())) {
    warnings.push(`"${trimmed}" is a common word. Consider a more unique app name.`);
  }

  // Check length
  if (trimmed.length < 3) {
    warnings.push('App name is very short. Consider using a more descriptive name.');
  }
  if (trimmed.length > 50) {
    errors.push('App name cannot exceed 50 characters');
    return { valid: false, errors, warnings };
  }

  // Normalize (capitalize first letter)
  const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

  return { valid: true, errors, warnings, normalized };
}

// Validate package name input
export function validatePackageNameInput(name: string): PackageNameValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Package name cannot be empty');
    return { valid: false, errors, warnings, suggestions };
  }

  const trimmed = name.trim().toLowerCase();

  // Check basic format
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(trimmed)) {
    errors.push('Package name must follow domain structure (e.g., com.example.myapp)');
    errors.push('Each segment must start with a letter and contain only lowercase letters, numbers, and underscores');

    // Generate suggestions
    if (!trimmed.startsWith('com.') && !trimmed.startsWith('org.') && !trimmed.startsWith('io.') && !trimmed.startsWith('net.')) {
      suggestions.push('com.' + trimmed);
    }
    if (trimmed.split('.').length < 2) {
      suggestions.push(trimmed + '.app');
      suggestions.push(trimmed + '.myapp');
    }

    return { valid: false, errors, warnings, suggestions };
  }

  // Minimum 2 segments
  const segments = trimmed.split('.');
  if (segments.length < 2) {
    errors.push('Package name must have at least 2 segments (e.g., com.app)');
    return { valid: false, errors, warnings, suggestions };
  }

  // Maximum segment length and keyword checks
  for (const segment of segments) {
    if (segment.length < 1) {
      errors.push('Package segments cannot be empty');
      return { valid: false, errors, warnings, suggestions };
    }
    if (segment.length > 50) {
      errors.push(`Package segment "${segment}" exceeds 50 character limit`);
      return { valid: false, errors, warnings, suggestions };
    }
    if (JAVA_KOTLIN_RESERVED_KEYWORDS.has(segment)) {
      errors.push(`Package segment "${segment}" is a reserved Java/Kotlin keyword`);
      return { valid: false, errors, warnings, suggestions };
    }
  }

  // Check for reserved prefixes
  const matchedPrefix = RESERVED_PACKAGE_PREFIXES.find(
    (prefix) => trimmed === prefix || trimmed.startsWith(prefix + '.')
  );
  if (matchedPrefix) {
    errors.push(`Package name cannot start with reserved prefix: ${matchedPrefix}`);
    return { valid: false, errors, warnings, suggestions };
  }

  // Warnings
  if (segments[0] === 'com' && (segments[1] === 'example' || segments[1] === 'test' || segments[1] === 'app')) {
    warnings.push('Using generic "com.example" prefix. Consider using your own domain.');
  }

  return { valid: true, errors, warnings };
}

// Validate package structure (similar to input but for verification)
export function validatePackageStructure(name: string): ValidationResult {
  return validatePackageNameInput(name);
}

// Validate directory path
export function validateDirectoryPath(path: string): DirectoryPathValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!path || path.trim().length === 0) {
    errors.push('Directory path cannot be empty');
    return { valid: false, errors, warnings };
  }

  const trimmed = path.trim();

  // Check for directory traversal
  if (trimmed.includes('..')) {
    errors.push('Directory path cannot contain ".." to prevent directory traversal');
    return { valid: false, errors, warnings };
  }

  // Allow normal path characters including Windows drive letters and backslashes.
  // Strip a leading drive prefix before checking characters that are invalid on
  // Windows and unsafe in generated cross-platform project paths.
  const pathWithoutDrivePrefix = trimmed.replace(/^[A-Za-z]:[\\/]?/, '');
  if (/[<>:"|?*\0]/.test(pathWithoutDrivePrefix)) {
    errors.push('Directory path contains invalid characters');
    return { valid: false, errors, warnings };
  }

  // Check for absolute path
  const isAbsolutePath = /^[A-Za-z]:\\|\//.test(trimmed) || trimmed.startsWith('/');

  // Warn about potential issues
  if (trimmed.includes(' ')) {
    warnings.push('Path contains spaces. This may cause issues with some build tools.');
  }

  if (isAbsolutePath && (trimmed.includes('$') || trimmed.includes('`'))) {
    warnings.push('Path contains special characters that may be interpreted as variables.');
  }

  return { valid: true, errors, warnings, normalized: trimmed };
}

// Validate email
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email cannot be empty');
    return { valid: false, errors, warnings };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    errors.push('Invalid email format');
    return { valid: false, errors, warnings };
  }

  return { valid: true, errors, warnings };
}

// Validate URL
export function validateUrl(url: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!url || url.trim().length === 0) {
    errors.push('URL cannot be empty');
    return { valid: false, errors, warnings };
  }

  try {
    new URL(url);
  } catch {
    errors.push('Invalid URL format');
    return { valid: false, errors, warnings };
  }

  return { valid: true, errors, warnings };
}

// Validate version string
export function validateVersion(version: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!version || version.trim().length === 0) {
    errors.push('Version cannot be empty');
    return { valid: false, errors, warnings };
  }

  // Semantic versioning format
  const versionRegex = /^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9.-]+)?$/;
  if (!versionRegex.test(version.trim())) {
    errors.push('Version must follow semantic versioning (e.g., 1.0.0 or 1.0.0-beta)');
    return { valid: false, errors, warnings };
  }

  return { valid: true, errors, warnings };
}

/**
 * Helper to strictly parse an integer SDK value
 */
function parseSdkNumber(sdk: number | string): number | null {
  if (typeof sdk === 'number') {
    return Number.isInteger(sdk) ? sdk : null;
  }
  const trimmed = String(sdk).trim();
  if (!/^-?\d+$/.test(trimmed)) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

// Validate Android min SDK
export function validateAndroidMinSdk(sdk: number | string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sdkNum = parseSdkNumber(sdk);

  if (sdkNum === null) {
    errors.push('Min SDK must be a valid integer');
    return { valid: false, errors, warnings };
  }

  if (sdkNum < 21) {
    errors.push('Min SDK must be at least 21 (Android 5.0)');
    return { valid: false, errors, warnings };
  }

  if (sdkNum > 37) {
    warnings.push('Min SDK is very high. This excludes older devices.');
  }

  return { valid: true, errors, warnings };
}

// Validate Android target SDK
export function validateAndroidTargetSdk(sdk: number | string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sdkNum = parseSdkNumber(sdk);

  if (sdkNum === null) {
    errors.push('Target SDK must be a valid integer');
    return { valid: false, errors, warnings };
  }

  if (sdkNum < 21) {
    errors.push('Target SDK must be at least 21');
    return { valid: false, errors, warnings };
  }

  if (sdkNum > 37) {
    warnings.push('Target SDK exceeds latest stable (37). This might require preview SDK dependencies.');
  }

  return { valid: true, errors, warnings };
}

// Sanitize file name
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\0]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
}

// Sanitize package name
export function sanitizePackageName(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/_{2,}/g, '_')
    .replace(/^\.|\.$/g, '');

  const segments = cleaned
    .split('.')
    .map((segment) => {
      let s = segment.replace(/^[^a-z]+/, '');
      if (!s) s = 'app';
      if (JAVA_KOTLIN_RESERVED_KEYWORDS.has(s)) {
        s = `${s}app`;
      }
      return s;
    })
    .filter(Boolean);

  if (segments.length === 0) {
    return 'com.example.myapp';
  }
  if (segments.length === 1) {
    return `com.example.${segments[0]}`;
  }
  return segments.join('.');
}

/**
 * Derive a valid Android app name from an arbitrary string (e.g. directory basename)
 */
export function deriveValidAppName(rawName: string): string {
  const pascal = pascalCase(rawName);
  if (!pascal) {
    return 'MyApp';
  }
  if (/^[0-9]/.test(pascal)) {
    return `App${pascal}`;
  }
  return pascal.slice(0, 50);
}

/**
 * Derive a valid default package name from an app name
 */
export function deriveDefaultPackageName(appName: string): string {
  let segment = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
  segment = segment.replace(/^[0-9]+/, '');
  if (!segment) {
    segment = 'myapp';
  }
  if (JAVA_KOTLIN_RESERVED_KEYWORDS.has(segment)) {
    segment = `${segment}app`;
  }
  return `com.example.${segment}`;
}

/**
 * Split a string into alphanumeric words across camelCase, PascalCase, spaces, underscores, and hyphens
 */
function splitWords(str: string): string[] {
  if (!str) return [];
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
}

// String transformation utilities
export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function camelCase(str: string): string {
  const words = splitWords(str);
  return words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

export function pascalCase(str: string): string {
  const words = splitWords(str);
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function kebabCase(str: string): string {
  return splitWords(str)
    .map((word) => word.toLowerCase())
    .join('-');
}

export function snakeCase(str: string): string {
  return splitWords(str)
    .map((word) => word.toLowerCase())
    .join('_');
}

export function dotCase(str: string): string {
  return splitWords(str)
    .map((word) => word.toLowerCase())
    .join('.');
}
