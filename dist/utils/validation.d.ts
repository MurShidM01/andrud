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
export declare function validateAppName(name: string): AppNameValidation;
export declare function validatePackageNameInput(name: string): PackageNameValidation;
export declare function validatePackageStructure(name: string): ValidationResult;
export declare function validateDirectoryPath(path: string): DirectoryPathValidation;
export declare function validateEmail(email: string): ValidationResult;
export declare function validateUrl(url: string): ValidationResult;
export declare function validateVersion(version: string): ValidationResult;
export declare function validateAndroidMinSdk(sdk: number | string): ValidationResult;
export declare function validateAndroidTargetSdk(sdk: number | string): ValidationResult;
export declare function sanitizeFileName(name: string): string;
export declare function sanitizePackageName(name: string): string;
/**
 * Derive a valid Android app name from an arbitrary string (e.g. directory basename)
 */
export declare function deriveValidAppName(rawName: string): string;
/**
 * Derive a valid default package name from an app name
 */
export declare function deriveDefaultPackageName(appName: string): string;
export declare function capitalizeFirstLetter(str: string): string;
export declare function camelCase(str: string): string;
export declare function pascalCase(str: string): string;
export declare function kebabCase(str: string): string;
export declare function snakeCase(str: string): string;
export declare function dotCase(str: string): string;
//# sourceMappingURL=validation.d.ts.map