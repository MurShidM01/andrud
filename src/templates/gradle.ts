/**
 * Gradle build script, settings, properties, and ProGuard file generators
 */

import { GRADLE_VERSIONS, ANDROIDX_VERSIONS, COMPOSE_VERSIONS } from '../core/config.js';
import type { TemplateContext, GeneratedFile } from '../core/types.js';

export function generateSettingsGradle(ctx: TemplateContext): GeneratedFile {
  const isKmp = ctx.template === 'kotlin-multiplatform';
  const featurePreview = isKmp ? 'enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")\n\n' : '';
  const sharedInclude = isKmp ? '\ninclude(":shared")' : '';
  const reposMode = isKmp
    ? 'RepositoriesMode.PREFER_PROJECT'
    : 'RepositoriesMode.FAIL_ON_PROJECT_REPOS';
  const composeMultiplatformRepo = isKmp
    ? '\n        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")'
    : '';

  return {
    path: 'settings.gradle.kts',
    content: `${featurePreview}pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()${composeMultiplatformRepo}
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(${reposMode})
    repositories {
        google()
        mavenCentral()${composeMultiplatformRepo}
    }
}

rootProject.name = "${ctx.appName}"
include(":app")${sharedInclude}
`
  };
}

export function generateRootBuildGradle(ctx: TemplateContext): GeneratedFile {
  const kotlinVersion = ctx.gradle.kotlinVersion || GRADLE_VERSIONS.KOTLIN;
  const isKmp = ctx.template === 'kotlin-multiplatform';
  const cmpVersion =
    ctx.kmp?.composeMultiplatformVersion ||
    ctx.gradle.composeMultiplatformVersion ||
    GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM;

  const androidLibraryPlugin = isKmp
    ? `\n    id("com.android.library") version "${ctx.gradle.agpVersion}" apply false`
    : '';

  const kotlinPlugin =
    ctx.language === 'kotlin'
      ? `\n    id("org.jetbrains.kotlin.android") version "${kotlinVersion}" apply false`
      : '';

  const kmpPlugins = isKmp
    ? `\n    id("org.jetbrains.kotlin.multiplatform") version "${kotlinVersion}" apply false` +
      `\n    id("org.jetbrains.compose") version "${cmpVersion}" apply false` +
      `\n    id("org.jetbrains.kotlin.plugin.serialization") version "${kotlinVersion}" apply false`
    : '';

  const composePlugin =
    ctx.uiFramework === 'compose'
      ? `\n    id("org.jetbrains.kotlin.plugin.compose") version "${kotlinVersion}" apply false`
      : '';

  return {
    path: 'build.gradle.kts',
    content: `plugins {
    id("com.android.application") version "${ctx.gradle.agpVersion}" apply false${androidLibraryPlugin}${kotlinPlugin}${kmpPlugins}${composePlugin}
}
`
  };
}

export function generateGradleProperties(ctx: TemplateContext): GeneratedFile {
  const kmpProperties =
    ctx.template === 'kotlin-multiplatform'
      ? `
# Kotlin Multiplatform settings
kotlin.mpp.enableCInteropCommonization=true
org.jetbrains.compose.experimental.wasm.enabled=true
`
      : '';

  return {
    path: 'gradle.properties',
    content: `# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configureondemand=true

# Android settings
android.useAndroidX=${ctx.androidX !== false}
android.nonTransitiveRClass=true
android.suppressUnsupportedCompileSdk=${ctx.android.compileSdk}

# Kotlin settings
kotlin.code.style=official
${kmpProperties}`
  };
}

export function generateAppBuildGradle(ctx: TemplateContext): GeneratedFile {
  const isCompose = ctx.uiFramework === 'compose';
  const isKotlin = ctx.language === 'kotlin';
  const isKmp = ctx.template === 'kotlin-multiplatform';

  let plugins = 'plugins {\n    id("com.android.application")\n';
  if (isKotlin) {
    plugins += '    id("org.jetbrains.kotlin.android")\n';
    if (isCompose) {
      plugins += '    id("org.jetbrains.kotlin.plugin.compose")\n';
    }
  }
  plugins += '}\n\n';

  let config = `android {
    namespace = "${ctx.packageName}"
    compileSdk = ${ctx.android.compileSdk}

    defaultConfig {
        applicationId = "${ctx.packageName}"
        minSdk = ${ctx.android.minSdk}
        targetSdk = ${ctx.android.targetSdk}
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
`;

  if (isCompose) {
    config += `        vectorDrawables {
            useSupportLibrary = true
        }
`;
  }
  config += `    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
`;

  if (isKotlin) {
    config += `    kotlinOptions {
        jvmTarget = "17"
    }
`;
  }

  if (isCompose || ctx.viewBinding === true || ctx.dataBinding === true) {
    const buildFeatures: string[] = [];
    if (isCompose) buildFeatures.push('        compose = true');
    if (ctx.viewBinding === true && !isCompose) buildFeatures.push('        viewBinding = true');
    if (ctx.dataBinding === true) buildFeatures.push('        dataBinding = true');

    if (buildFeatures.length > 0) {
      config += `    buildFeatures {
${buildFeatures.join('\n')}
    }
`;
    }
  }

  config += `    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
`;

  if (isKmp) {
    config += `    implementation(project(":shared"))
`;
  }

  config += `    implementation("androidx.core:core${isKotlin ? '-ktx' : ''}:${ANDROIDX_VERSIONS.CORE_KTX}")
    implementation("androidx.appcompat:appcompat:${ANDROIDX_VERSIONS.APP_COMPAT}")
    implementation("com.google.android.material:material:${ANDROIDX_VERSIONS.MATERIAL}")
    implementation("androidx.constraintlayout:constraintlayout:${ANDROIDX_VERSIONS.CONSTRAINT_LAYOUT}")
`;

  if (isCompose) {
    const composeBom = ctx.gradle.composeBomVersion || COMPOSE_VERSIONS.BOM;
    config += `    implementation(platform("androidx.compose:compose-bom:${composeBom}"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.activity:activity-compose:${COMPOSE_VERSIONS.ACTIVITY}")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:${COMPOSE_VERSIONS.LIFECYCLE}")
    implementation("androidx.navigation:navigation-compose:${COMPOSE_VERSIONS.NAVIGATION}")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
`;
  } else if (isKotlin) {
    config += `    implementation("androidx.activity:activity-ktx:${ANDROIDX_VERSIONS.ACTIVITY}")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:${ANDROIDX_VERSIONS.LIFECYCLE}")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:${ANDROIDX_VERSIONS.LIFECYCLE}")
`;
  } else {
    config += `    implementation("androidx.activity:activity:${ANDROIDX_VERSIONS.ACTIVITY}")
    implementation("androidx.lifecycle:lifecycle-runtime:${ANDROIDX_VERSIONS.LIFECYCLE}")
    implementation("androidx.lifecycle:lifecycle-viewmodel:${ANDROIDX_VERSIONS.LIFECYCLE}")
`;
  }

  // Add native C++ configuration if needed
  if (ctx.template === 'native-cpp') {
    const ndkVersion = ctx.nativeCpp?.ndkVersion ?? GRADLE_VERSIONS.NDK;
    const cppStandard = ctx.nativeCpp?.cppStandard ?? 'c++17';
    const stlType = ctx.nativeCpp?.stlType ?? 'c++_shared';
    const abiFilters = ctx.nativeCpp?.abiFilters ?? ['armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'];
    const abiList = abiFilters.map((abi) => `"${abi}"`).join(', ');

    config = config.replace(
      '        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"',
      `        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        externalNativeBuild {
            cmake {
                cppFlags += "-std=${cppStandard}"
                arguments += "-DANDROID_STL=${stlType}"
                abiFilters += listOf(${abiList})
            }
        }`
    );

    config = config.replace(
      '    compileOptions {',
      `    ndkVersion = "${ndkVersion}"

    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
        }
    }

    compileOptions {`
    );
  }

  config += `    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
`;

  return {
    path: 'app/build.gradle.kts',
    content: plugins + config
  };
}

export function generateAppProguardRules(_ctx: TemplateContext): GeneratedFile {
  return {
    path: 'app/proguard-rules.pro',
    content: `# ProGuard rules for Android
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
`
  };
}
