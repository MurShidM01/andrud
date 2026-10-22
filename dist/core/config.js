/**
 * Configuration constants for Android, Gradle, and Kotlin Multiplatform versions
 */
/**
 * Default Android SDK configuration
 * minSdk 24 = Android 7.0 (Nougat)
 * targetSdk 37 = Android 17
 */
export const ANDROID_SDK_DEFAULTS = {
    MIN_SDK: 24,
    KMP_MIN_SDK: 24,
    TARGET_SDK: 37,
    COMPILE_SDK: 37,
    BUILD_TOOLS_VERSION: '37.0.0'
};
/**
 * Gradle-related versions
 */
export const GRADLE_VERSIONS = {
    AGP: '8.7.3',
    GRADLE: '8.14.4',
    KOTLIN: '2.0.21',
    COMPOSE_COMPILER: '1.5.14',
    COMPOSE_BOM: '2025.01.00',
    COMPOSE_MULTIPLATFORM: '1.7.3',
    KOTLINX_COROUTINES: '1.9.0',
    KOTLINX_SERIALIZATION: '1.7.3',
    NDK: '28.2.13676358'
};
/**
 * Default Kotlin Multiplatform target platforms
 */
export const DEFAULT_KMP_PLATFORMS = ['android', 'ios', 'desktop', 'wasmJs'];
/**
 * AndroidX library versions
 */
export const ANDROIDX_VERSIONS = {
    CORE_KTX: '1.15.0',
    APP_COMPAT: '1.7.0',
    MATERIAL: '1.12.0',
    LIFECYCLE: '2.8.7',
    ACTIVITY: '1.9.3',
    CONSTRAINT_LAYOUT: '2.2.0',
    RECYCLER_VIEW: '1.3.2',
    CARD_VIEW: '1.0.0',
    SWIPE_REFRESH: '1.1.0',
    NAVIGATION: '2.8.4',
    ROOM: '2.6.1',
    WORK: '2.10.0',
    HILT: '2.52'
};
/**
 * Compose versions
 */
export const COMPOSE_VERSIONS = {
    BOM: '2025.01.00',
    UI: '1.7.6',
    UI_GRAPHICS: '1.7.6',
    UI_TOOLING: '1.7.6',
    MATERIAL3: '1.3.1',
    MATERIAL_ICONS: '1.7.6',
    FOUNDATION: '1.7.6',
    ACTIVITY: '1.9.3',
    LIFECYCLE: '2.8.7',
    NAVIGATION: '2.8.4'
};
/**
 * Default Gradle properties for Android projects
 */
export function getDefaultGradleProperties() {
    return {
        'org.gradle.jvmargs': '-Xmx2048m -Dfile.encoding=UTF-8',
        'android.useAndroidX': true,
        'android.enableJetifier': true,
        'kotlin.code.style': 'official',
        'org.gradle.parallel': true,
        'org.gradle.caching': true,
        'org.gradle.configureondemand': true,
        'android.nonTransitiveRClass': true,
        'android.defaults.buildfeatures.buildconfig': true
    };
}
/**
 * Get recommended minimum SDK (Android 7.0 / API 24)
 */
export function getRecommendedMinSdk() {
    return ANDROID_SDK_DEFAULTS.MIN_SDK;
}
/**
 * Get target SDK for a given year
 */
export function getTargetSdkForYear(year) {
    if (year >= 2026) {
        return 37; // Android 17
    }
    else if (year >= 2025) {
        return 36; // Android 16
    }
    else if (year >= 2024) {
        return 35; // Android 15
    }
    else if (year >= 2023) {
        return 34; // Android 14
    }
    else if (year >= 2022) {
        return 33; // Android 13
    }
    else {
        return 32; // Android 12L
    }
}
export const TEMPLATE_CONFIGS = {
    'kotlin-compose': {
        language: 'kotlin',
        uiFramework: 'compose',
        minSdk: ANDROID_SDK_DEFAULTS.MIN_SDK,
        targetSdk: ANDROID_SDK_DEFAULTS.TARGET_SDK,
        compileSdk: ANDROID_SDK_DEFAULTS.COMPILE_SDK,
        kotlinVersion: GRADLE_VERSIONS.KOTLIN,
        agpVersion: GRADLE_VERSIONS.AGP,
        gradleVersion: GRADLE_VERSIONS.GRADLE,
        composeEnabled: true
    },
    'kotlin-xml': {
        language: 'kotlin',
        uiFramework: 'xml',
        minSdk: ANDROID_SDK_DEFAULTS.MIN_SDK,
        targetSdk: ANDROID_SDK_DEFAULTS.TARGET_SDK,
        compileSdk: ANDROID_SDK_DEFAULTS.COMPILE_SDK,
        kotlinVersion: GRADLE_VERSIONS.KOTLIN,
        agpVersion: GRADLE_VERSIONS.AGP,
        gradleVersion: GRADLE_VERSIONS.GRADLE,
        composeEnabled: false
    },
    'java-xml': {
        language: 'java',
        uiFramework: 'xml',
        minSdk: ANDROID_SDK_DEFAULTS.MIN_SDK,
        targetSdk: ANDROID_SDK_DEFAULTS.TARGET_SDK,
        compileSdk: ANDROID_SDK_DEFAULTS.COMPILE_SDK,
        kotlinVersion: '', // Not used for Java
        agpVersion: GRADLE_VERSIONS.AGP,
        gradleVersion: GRADLE_VERSIONS.GRADLE,
        composeEnabled: false
    },
    'native-cpp': {
        language: 'kotlin',
        uiFramework: 'xml',
        minSdk: ANDROID_SDK_DEFAULTS.MIN_SDK,
        targetSdk: ANDROID_SDK_DEFAULTS.TARGET_SDK,
        compileSdk: ANDROID_SDK_DEFAULTS.COMPILE_SDK,
        kotlinVersion: GRADLE_VERSIONS.KOTLIN,
        agpVersion: GRADLE_VERSIONS.AGP,
        gradleVersion: GRADLE_VERSIONS.GRADLE,
        composeEnabled: false,
        ndkVersion: GRADLE_VERSIONS.NDK
    },
    'kotlin-multiplatform': {
        language: 'kotlin',
        uiFramework: 'compose',
        minSdk: ANDROID_SDK_DEFAULTS.MIN_SDK,
        targetSdk: ANDROID_SDK_DEFAULTS.TARGET_SDK,
        compileSdk: ANDROID_SDK_DEFAULTS.COMPILE_SDK,
        kotlinVersion: GRADLE_VERSIONS.KOTLIN,
        agpVersion: GRADLE_VERSIONS.AGP,
        gradleVersion: GRADLE_VERSIONS.GRADLE,
        composeEnabled: true,
        kmpEnabled: true,
        composeMultiplatformVersion: GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM,
        platforms: [...DEFAULT_KMP_PLATFORMS]
    }
};
/**
 * Resolve template alias (e.g. 'kmp' -> 'kotlin-multiplatform')
 */
export function resolveTemplateId(template) {
    const normalized = template.trim().toLowerCase();
    if (normalized === 'kmp' || normalized === 'cmp' || normalized === 'multiplatform') {
        return 'kotlin-multiplatform';
    }
    return template;
}
/**
 * Parse and validate a comma-separated list or array of KMP target platforms
 */
export function parseKmpPlatforms(input) {
    if (!input) {
        return [...DEFAULT_KMP_PLATFORMS];
    }
    const rawList = Array.isArray(input)
        ? input
        : input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    const normalized = [];
    for (const item of rawList) {
        const lower = item.toLowerCase();
        if (lower === 'android') {
            if (!normalized.includes('android'))
                normalized.push('android');
        }
        else if (lower === 'ios') {
            if (!normalized.includes('ios'))
                normalized.push('ios');
        }
        else if (lower === 'desktop' || lower === 'jvm') {
            if (!normalized.includes('desktop'))
                normalized.push('desktop');
        }
        else if (lower === 'wasm' || lower === 'wasmjs' || lower === 'web' || lower === 'js') {
            if (!normalized.includes('wasmJs'))
                normalized.push('wasmJs');
        }
        else {
            throw new Error(`Invalid Kotlin Multiplatform target "${item}". Valid targets: android, ios, desktop, wasmJs`);
        }
    }
    // Always ensure android is included so the Android app module can build
    if (!normalized.includes('android')) {
        normalized.unshift('android');
    }
    return normalized;
}
/**
 * Get template configuration
 */
export function getTemplateConfig(template) {
    const resolved = resolveTemplateId(template);
    const config = TEMPLATE_CONFIGS[resolved];
    if (!config) {
        throw new Error(`Unknown template: ${template}`);
    }
    return config;
}
//# sourceMappingURL=config.js.map