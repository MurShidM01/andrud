/**
 * Configuration constants for Android and Gradle versions
 */
/**
 * Default Android SDK configuration
 */
export declare const ANDROID_SDK_DEFAULTS: {
    MIN_SDK: number;
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
    NDK: string;
};
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
 * Get recommended minimum SDK based on year
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
    uiFramework: 'xml' | 'compose' | 'none';
    minSdk: number;
    targetSdk: number;
    compileSdk: number;
    kotlinVersion: string;
    agpVersion: string;
    gradleVersion: string;
    composeEnabled: boolean;
    ndkVersion?: string;
}
export declare const TEMPLATE_CONFIGS: Record<string, TemplateConfig>;
/**
 * Get template configuration
 */
export declare function getTemplateConfig(template: string): TemplateConfig;
//# sourceMappingURL=config.d.ts.map