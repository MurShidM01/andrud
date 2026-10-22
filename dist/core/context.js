/**
 * Context builder for generating Android and Kotlin Multiplatform project context
 */
import { camelCase, kebabCase, pascalCase, snakeCase } from '../utils/validation.js';
import { getPackageVersion } from '../utils/version.js';
import { GRADLE_VERSIONS, ANDROID_SDK_DEFAULTS, DEFAULT_KMP_PLATFORMS, getTemplateConfig, parseKmpPlatforms, resolveTemplateId } from './config.js';
/**
 * Build default context from basic parameters
 */
export function buildDefaultProjectContext(appName, packageName, projectDirectory, template, features = {}, minSdk, targetSdk, kmpPlatforms) {
    const resolvedTemplate = resolveTemplateId(template);
    const isKmp = resolvedTemplate === 'kotlin-multiplatform';
    const isCompose = resolvedTemplate === 'kotlin-compose' || isKmp;
    const isNativeCpp = resolvedTemplate === 'native-cpp';
    const isKotlin = resolvedTemplate !== 'java-xml';
    const isXml = !isCompose;
    // Get template config for version info
    const templateConfig = getTemplateConfig(resolvedTemplate);
    const resolvedMinSdk = minSdk ?? templateConfig.minSdk;
    const resolvedTargetSdk = targetSdk ?? templateConfig.targetSdk;
    const resolvedCompileSdk = Math.max(templateConfig.compileSdk, resolvedTargetSdk, resolvedMinSdk);
    // Create Android SDK config
    const android = {
        minSdk: resolvedMinSdk,
        targetSdk: resolvedTargetSdk,
        compileSdk: resolvedCompileSdk,
        buildToolsVersion: ANDROID_SDK_DEFAULTS.BUILD_TOOLS_VERSION
    };
    // Create Gradle config
    const gradle = {
        agpVersion: templateConfig.agpVersion,
        gradleVersion: templateConfig.gradleVersion,
        kotlinVersion: isKotlin ? templateConfig.kotlinVersion : undefined,
        composeCompilerVersion: isCompose ? GRADLE_VERSIONS.COMPOSE_COMPILER : undefined,
        composeBomVersion: isCompose ? GRADLE_VERSIONS.COMPOSE_BOM : undefined,
        composeMultiplatformVersion: isKmp ? GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM : undefined
    };
    // Build project features
    const projectFeatures = {
        git: features.git ?? true,
        readme: features.readme ?? true,
        androidX: features.androidX ?? true,
        kotlinDsl: features.kotlinDsl ?? true,
        adaptiveIcon: features.adaptiveIcon ?? true,
        material3: isCompose || (features.material3 ?? true),
        viewBinding: features.viewBinding ?? isXml,
        dataBinding: features.dataBinding ?? false,
        jetpackCompose: isCompose ? true : (features.jetpackCompose ?? false),
        kotlinMultiplatform: isKmp ? true : (features.kotlinMultiplatform ?? false)
    };
    // Build native C++ config if needed
    const nativeCpp = isNativeCpp
        ? {
            cppStandard: 'c++17',
            ndkVersion: templateConfig.ndkVersion ?? GRADLE_VERSIONS.NDK,
            stlType: 'c++_shared',
            abiFilters: ['armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64']
        }
        : undefined;
    // Build Kotlin Multiplatform config if needed
    const resolvedPlatforms = isKmp ? parseKmpPlatforms(kmpPlatforms) : undefined;
    const kmp = isKmp
        ? {
            platforms: resolvedPlatforms ?? [...DEFAULT_KMP_PLATFORMS],
            composeMultiplatformVersion: GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM,
            coroutinesVersion: GRADLE_VERSIONS.KOTLINX_COROUTINES,
            serializationVersion: GRADLE_VERSIONS.KOTLINX_SERIALIZATION,
            sharedModuleName: 'shared',
            includeIosApp: (resolvedPlatforms ?? DEFAULT_KMP_PLATFORMS).includes('ios')
        }
        : undefined;
    return {
        appName,
        packageName,
        projectDirectory,
        template: resolvedTemplate,
        language: templateConfig.language,
        uiFramework: templateConfig.uiFramework,
        android,
        gradle,
        ...projectFeatures,
        features: projectFeatures,
        nativeCpp,
        kmp
    };
}
/**
 * Build full template context with all derived values
 */
export function buildTemplateContext(context) {
    const resolvedTemplate = resolveTemplateId(context.template);
    const isKmp = resolvedTemplate === 'kotlin-multiplatform';
    // Transform app name to various cases
    const appNameSnake = snakeCase(context.appName);
    const appNameKebab = kebabCase(context.appName);
    const appNamePascal = pascalCase(context.appName);
    const appNameCamel = camelCase(context.appName);
    const appNameLower = context.appName.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Convert package name to path format (e.g., "com.example.myapp" -> "com/example/myapp")
    const packagePath = context.packageName.replace(/\./g, '/');
    // Get current year
    const year = context.year ?? new Date().getFullYear().toString();
    // Build native C++ config
    const nativeCpp = context.nativeCpp
        ? {
            cppStandard: (context.nativeCpp.cppStandard === 'c++20' ? 'c++20' : 'c++17'),
            ndkVersion: context.nativeCpp.ndkVersion,
            stlType: context.nativeCpp.stlType ?? 'c++_shared',
            abiFilters: context.nativeCpp.abiFilters
        }
        : undefined;
    // Build Kotlin Multiplatform config
    const kmpPlatforms = context.kmp?.platforms && context.kmp.platforms.length > 0
        ? parseKmpPlatforms(context.kmp.platforms)
        : [...DEFAULT_KMP_PLATFORMS];
    const kmp = isKmp || context.kmp
        ? {
            platforms: kmpPlatforms,
            composeMultiplatformVersion: context.kmp?.composeMultiplatformVersion ??
                context.gradle.composeMultiplatformVersion ??
                GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM,
            coroutinesVersion: context.kmp?.coroutinesVersion ?? GRADLE_VERSIONS.KOTLINX_COROUTINES,
            serializationVersion: context.kmp?.serializationVersion ?? GRADLE_VERSIONS.KOTLINX_SERIALIZATION,
            sharedModuleName: context.kmp?.sharedModuleName ?? 'shared',
            includeIosApp: context.kmp?.includeIosApp ?? kmpPlatforms.includes('ios')
        }
        : undefined;
    // Build project features from context (features may be nested or at top level)
    const rawFeatures = (context.features ?? context);
    const resolveBool = (key, fallback) => {
        if (typeof rawFeatures[key] === 'boolean')
            return rawFeatures[key];
        const topVal = context[key];
        if (typeof topVal === 'boolean')
            return topVal;
        return fallback;
    };
    const resolveOptionalBool = (key) => {
        if (typeof rawFeatures[key] === 'boolean')
            return rawFeatures[key];
        const topVal = context[key];
        if (typeof topVal === 'boolean')
            return topVal;
        return undefined;
    };
    const features = {
        git: resolveBool('git', true),
        readme: resolveBool('readme', true),
        androidX: resolveBool('androidX', true),
        kotlinDsl: resolveBool('kotlinDsl', true),
        adaptiveIcon: resolveBool('adaptiveIcon', true),
        material3: resolveBool('material3', true),
        viewBinding: resolveOptionalBool('viewBinding'),
        dataBinding: resolveOptionalBool('dataBinding'),
        jetpackCompose: resolveOptionalBool('jetpackCompose'),
        kotlinMultiplatform: isKmp ? true : resolveOptionalBool('kotlinMultiplatform')
    };
    const buildToolsVersion = context.android.buildToolsVersion ?? `${context.android.compileSdk}.0.0`;
    // Build the complete template context
    const templateContext = {
        appName: context.appName,
        packageName: context.packageName,
        projectDirectory: context.projectDirectory,
        template: resolvedTemplate,
        language: context.language,
        uiFramework: context.uiFramework,
        android: {
            minSdk: context.android.minSdk,
            targetSdk: context.android.targetSdk,
            compileSdk: context.android.compileSdk,
            buildToolsVersion
        },
        gradle: {
            agpVersion: context.gradle.agpVersion,
            gradleVersion: context.gradle.gradleVersion,
            kotlinVersion: context.gradle.kotlinVersion,
            composeCompilerVersion: context.gradle.composeCompilerVersion,
            composeBomVersion: context.gradle.composeBomVersion,
            composeMultiplatformVersion: context.gradle.composeMultiplatformVersion ??
                (isKmp ? GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM : undefined)
        },
        appNameSnake,
        appNameKebab,
        appNamePascal,
        appNameCamel,
        appNameLower,
        packagePath,
        year,
        generatorVersion: getPackageVersion(),
        ...features,
        nativeCpp,
        kmp
    };
    return templateContext;
}
/**
 * Validate context has all required fields
 */
export function validateContext(context) {
    const errors = [];
    if (!context.appName)
        errors.push('appName is required');
    if (!context.packageName)
        errors.push('packageName is required');
    if (!context.projectDirectory)
        errors.push('projectDirectory is required');
    if (!context.template)
        errors.push('template is required');
    if (!context.language)
        errors.push('language is required');
    if (!context.uiFramework)
        errors.push('uiFramework is required');
    if (!context.android)
        errors.push('android config is required');
    if (!context.gradle)
        errors.push('gradle config is required');
    if (context.android) {
        if (!context.android.minSdk)
            errors.push('android.minSdk is required');
        if (!context.android.targetSdk)
            errors.push('android.targetSdk is required');
        if (!context.android.compileSdk)
            errors.push('android.compileSdk is required');
        if (context.android.minSdk &&
            context.android.targetSdk &&
            context.android.minSdk > context.android.targetSdk) {
            errors.push('android.minSdk cannot be greater than android.targetSdk');
        }
    }
    if (context.gradle) {
        if (!context.gradle.agpVersion)
            errors.push('gradle.agpVersion is required');
        if (!context.gradle.gradleVersion)
            errors.push('gradle.gradleVersion is required');
    }
    return { valid: errors.length === 0, errors };
}
//# sourceMappingURL=context.js.map