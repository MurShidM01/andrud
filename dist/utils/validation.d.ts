/**
 * Validation utilities for app names, package names, and paths
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
export declare function capitalizeFirstLetter(str: string): string;
export declare function camelCase(str: string): string;
export declare function pascalCase(str: string): string;
export declare function kebabCase(str: string): string;
export declare function snakeCase(str: string): string;
export declare function dotCase(str: string): string;
//# sourceMappingURL=validation.d.ts.map