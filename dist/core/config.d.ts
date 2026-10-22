/**
 * Configuration constants for Android, Gradle, and Kotlin Multiplatform versions
 */
import type { KmpPlatform, TemplateType } from './types.js';
/**
 * Default Android SDK configuration
 * minSdk 24 = Android 7.0 (Nougat)
 * targetSdk 37 = Android 17
 */
export declare const ANDROID_SDK_DEFAULTS: {
    MIN_SDK: number;
    KMP_MIN_SDK: number;
    TARGET_SDK: number;
    COMPILE_SDK: number;
    BUILD_TOOLS_VERSION: string;
};
/**
 * Gradle-related versions
 */
export declare const GRADLE_VERSIONS: {
    AGP: string;
    GRADLE: string;
    KOTLIN: string;
    COMPOSE_COMPILER: string;
    COMPOSE_BOM: string;
    COMPOSE_MULTIPLATFORM: string;
    KOTLINX_COROUTINES: string;
    KOTLINX_SERIALIZATION: string;
    NDK: string;
};
/**
 * Default Kotlin Multiplatform target platforms
 */
export declare const DEFAULT_KMP_PLATFORMS: KmpPlatform[];
/**
 * AndroidX library versions
 */
export declare const ANDROIDX_VERSIONS: {
    CORE_KTX: string;
    APP_COMPAT: string;
    MATERIAL: string;
    LIFECYCLE: string;
    ACTIVITY: string;
    CONSTRAINT_LAYOUT: string;
    RECYCLER_VIEW: string;
    CARD_VIEW: string;
    SWIPE_REFRESH: string;
    NAVIGATION: string;
    ROOM: string;
    WORK: string;
    HILT: string;
};
/**
 * Compose versions
 */
export declare const COMPOSE_VERSIONS: {
    BOM: string;
    UI: string;
    UI_GRAPHICS: string;
    UI_TOOLING: string;
    MATERIAL3: string;
    MATERIAL_ICONS: string;
    FOUNDATION: string;
    ACTIVITY: string;
    LIFECYCLE: string;
    NAVIGATION: string;
};
/**
 * Default Gradle properties for Android projects
 */
export declare function getDefaultGradleProperties(): Record<string, string | number | boolean>;
/**
 * Get recommended minimum SDK (Android 7.0 / API 24)
 */
export declare function getRecommendedMinSdk(): number;
/**
 * Get target SDK for a given year
 */
export declare function getTargetSdkForYear(year: number): number;
/**
 * Template-specific configurations
 */
export interface TemplateConfig {
    language: 'kotlin' | 'java';
    uiFramework: 'xml' | 'compose';
    minSdk: number;
    targetSdk: number;
    compileSdk: number;
    kotlinVersion: string;
    agpVersion: string;
    gradleVersion: string;
    composeEnabled: boolean;
    kmpEnabled?: boolean;
    composeMultiplatformVersion?: string;
    platforms?: KmpPlatform[];
    ndkVersion?: string;
}
export declare const TEMPLATE_CONFIGS: Record<string, TemplateConfig>;
/**
 * Resolve template alias (e.g. 'kmp' -> 'kotlin-multiplatform')
 */
export declare function resolveTemplateId(template: string): TemplateType | string;
/**
 * Parse and validate a comma-separated list or array of KMP target platforms
 */
export declare function parseKmpPlatforms(input?: string | KmpPlatform[]): KmpPlatform[];
/**
 * Get template configuration
 */
export declare function getTemplateConfig(template: string): TemplateConfig;
//# sourceMappingURL=config.d.ts.map