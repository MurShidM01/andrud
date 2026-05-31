/**
 * Configuration constants for Android and Gradle versions
 */

/**
 * Default Android SDK configuration
 */
export const ANDROID_SDK_DEFAULTS = {
  MIN_SDK: 24,
  TARGET_SDK: 36,
  COMPILE_SDK: 36,
  BUILD_TOOLS_VERSION: '36.0.0'
};

/**
 * Gradle-related versions
 */
export const GRADLE_VERSIONS = {
  AGP: '8.7.3',
  GRADLE: '8.14',
  KOTLIN: '2.0.21',
  COMPOSE_COMPILER: '1.5.14',
  COMPOSE_BOM: '2024.09.03',
  NDK: '28.2.13676358'
};

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
  UI: '1.3.0',
  UI_GRAPHICS: '1.3.0',
  UI_TOOLING: '1.3.0',
  MATERIAL3: '1.3.0',
  MATERIAL_ICONS: '1.3.0',
  FOUNDATION: '1.3.0',
  ACTIVITY: '1.9.3',
  LIFECYCLE: '2.8.7',
  NAVIGATION: '2.8.4'
};

/**
 * Default Gradle properties for Android projects
 */
export function getDefaultGradleProperties(): Record<string, string | number | boolean> {
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
 * Get recommended minimum SDK based on year
 */
export function getRecommendedMinSdk(): number {
  return 24; // Android 7.0 Nougat
}

/**
 * Get target SDK for a given year
 */
export function getTargetSdkForYear(year: number): number {
  // By default, target the latest stable SDK
  if (year >= 2024) {
    return 35; // Android 15
  } else if (year >= 2023) {
    return 34; // Android 14
  } else if (year >= 2022) {
    return 33; // Android 13
  } else {
    return 32; // Android 12L
  }
}

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

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  'kotlin-compose': {
    language: 'kotlin',
    uiFramework: 'compose',
    minSdk: 31,
    targetSdk: 36,
    compileSdk: 36,
    kotlinVersion: GRADLE_VERSIONS.KOTLIN,
    agpVersion: GRADLE_VERSIONS.AGP,
    gradleVersion: GRADLE_VERSIONS.GRADLE,
    composeEnabled: true
  },
  'kotlin-xml': {
    language: 'kotlin',
    uiFramework: 'xml',
    minSdk: 31,
    targetSdk: 36,
    compileSdk: 36,
    kotlinVersion: GRADLE_VERSIONS.KOTLIN,
    agpVersion: GRADLE_VERSIONS.AGP,
    gradleVersion: GRADLE_VERSIONS.GRADLE,
    composeEnabled: false
  },
  'java-xml': {
    language: 'java',
    uiFramework: 'xml',
    minSdk: 31,
    targetSdk: 36,
    compileSdk: 36,
    kotlinVersion: '', // Not used for Java
    agpVersion: GRADLE_VERSIONS.AGP,
    gradleVersion: GRADLE_VERSIONS.GRADLE,
    composeEnabled: false
  },
  'native-cpp': {
    language: 'kotlin',
    uiFramework: 'xml',
    minSdk: 31,
    targetSdk: 36,
    compileSdk: 36,
    kotlinVersion: GRADLE_VERSIONS.KOTLIN,
    agpVersion: GRADLE_VERSIONS.AGP,
    gradleVersion: GRADLE_VERSIONS.GRADLE,
    composeEnabled: false,
    ndkVersion: GRADLE_VERSIONS.NDK
  }
};

/**
 * Get template configuration
 */
export function getTemplateConfig(template: string): TemplateConfig {
  const config = TEMPLATE_CONFIGS[template];
  return config ?? TEMPLATE_CONFIGS['kotlin-xml']!;
}