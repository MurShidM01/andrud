/**
 * Project generator - creates Android project structure and files
 */
import { exists, writeFile, createDirectory, isDirectory } from '../utils/filesystem.js';
import { GRADLE_VERSIONS } from './config.js';
import pc from 'picocolors';
import { join } from 'path';
/**
 * Validate project directory can be used
 */
export async function validateProjectDirectory(projectPath, options = { overwrite: false }) {
    const pathExists = await exists(projectPath);
    if (pathExists) {
        const isDir = await isDirectory(projectPath);
        if (!isDir) {
            return { valid: false, error: 'Project path exists but is not a directory' };
        }
        const dirContent = await getDirectoryContents(projectPath);
        if (dirContent.length > 0 && !options.overwrite) {
            return {
                valid: false,
                error: 'Directory is not empty. Use --force to overwrite existing files.',
                existingFiles: dirContent
            };
        }
    }
    return { valid: true };
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
    return { valid: errors.length === 0, errors };
}
/**
 * Prepare project directory structure
 */
export async function prepareProjectStructure(projectPath, context) {
    const createdPaths = [];
    const errors = [];
    const directories = [
        '',
        'gradle/wrapper',
        'app/src/main/java',
        'app/src/main/res/layout',
        'app/src/main/res/values',
        'app/src/main/res/values-night',
        'app/src/main/res/drawable',
        'app/src/main/res/xml',
        'app/src/main/res/mipmap-anydpi-v26',
        'app/src/main/res/mipmap-hdpi',
        'app/src/main/res/mipmap-mdpi',
        'app/src/main/res/mipmap-xhdpi',
        'app/src/main/res/mipmap-xxhdpi',
        'app/src/main/res/mipmap-xxxhdpi',
        'app/src/test/java',
        'app/src/androidTest/java',
        context.language === 'kotlin' ? 'app/src/main/kotlin' : '',
        context.template === 'native-cpp' ? 'app/src/main/cpp' : ''
    ].filter(d => d !== '');
    const packagePath = context.packageName.replace(/\./g, '/');
    directories.push(`app/src/main/java/${packagePath}`);
    if (context.language === 'kotlin') {
        directories.push(`app/src/main/kotlin/${packagePath}`);
    }
    // Add UI theme directories for Jetpack Compose projects
    if (context.uiFramework === 'compose' && context.language === 'kotlin') {
        directories.push(`app/src/main/kotlin/${packagePath}/ui`);
        directories.push(`app/src/main/kotlin/${packagePath}/ui/theme`);
    }
    // Add native cpp directories
    if (context.template === 'native-cpp') {
        directories.push(`app/src/main/cpp`);
        directories.push(`app/src/main/jni`);
    }
    for (const dir of directories) {
        const fullPath = join(projectPath, dir);
        try {
            await createDirectory(fullPath);
            createdPaths.push(dir);
        }
        catch (error) {
            errors.push(`Failed to create directory ${dir}: ${error.message}`);
        }
    }
    return { success: errors.length === 0, createdPaths, errors };
}
/**
 * Generate all project files
 */
export async function generateProject(context, options = {}) {
    const startTime = Date.now();
    const generatedFiles = [];
    const skippedFiles = [];
    const errors = [];
    const warnings = [];
    const projectPath = context.projectDirectory;
    const contextValidation = validateContext(context);
    if (!contextValidation.valid) {
        return {
            success: false,
            projectPath,
            generatedFiles: [],
            skippedFiles: [],
            errors: contextValidation.errors.map(msg => ({ message: msg })),
            warnings,
            duration: Date.now() - startTime
        };
    }
    const dirValidation = await validateProjectDirectory(projectPath, { overwrite: options.overwrite ?? false });
    if (!dirValidation.valid) {
        return {
            success: false,
            projectPath,
            generatedFiles: [],
            skippedFiles: [],
            errors: [{ message: dirValidation.error, code: 'DIR_VALIDATION_ERROR' }],
            warnings,
            duration: Date.now() - startTime
        };
    }
    const prepResult = await prepareProjectStructure(projectPath, context);
    if (!prepResult.success) {
        errors.push(...prepResult.errors.map(msg => ({ message: msg, code: 'DIR_CREATE_ERROR' })));
    }
    generatedFiles.push(...prepResult.createdPaths);
    const filesToGenerate = [
        generateSettingsGradle(context),
        generateRootBuildGradle(context),
        generateGradleProperties(context),
        generateGitIgnore(context),
        generateReadme(context),
        generateGradleWrapperProperties(context),
        generateGradlewBat(context),
        generateGradlewUnix(context),
        generateAppBuildGradle(context),
        generateAppProguardRules(context),
        generateAppManifest(context),
        generateApplicationClass(context),
        generateMainActivity(context),
        generateStrings(context),
        generateColors(context),
        generateThemes(context),
        generateAppIcon(context),
        generateActivityLayout(context),
        ...generateSourceSetFiles(context)
    ].filter((f) => f !== null && typeof f === 'object' && 'path' in f);
    for (const file of filesToGenerate) {
        try {
            const filePath = join(projectPath, file.path);
            const fileExists = await exists(filePath);
            if (fileExists && !options.overwrite && file.overwrite !== true) {
                skippedFiles.push(file.path);
                if (options.verbose) {
                    console.log(pc.yellow(`Skipped: ${file.path} (already exists)`));
                }
                continue;
            }
            await writeFile(filePath, file.content);
            generatedFiles.push(file.path);
            if (options.verbose) {
                console.log(pc.green(`Generated: ${file.path}`));
            }
        }
        catch (error) {
            errors.push({
                file: file.path,
                message: error.message,
                code: 'WRITE_ERROR'
            });
        }
    }
    const duration = Date.now() - startTime;
    const success = errors.length === 0;
    return {
        success,
        projectPath,
        generatedFiles,
        skippedFiles,
        errors,
        warnings,
        duration
    };
}
function generateSettingsGradle(ctx) {
    return {
        path: 'settings.gradle.kts',
        content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${ctx.appName}"
include(":app")
`
    };
}
function generateRootBuildGradle(ctx) {
    const kotlinPlugin = ctx.language === 'kotlin' ? `
    id("org.jetbrains.kotlin.android") version "${ctx.gradle.kotlinVersion || GRADLE_VERSIONS.KOTLIN}" apply false` : '';
    const composePlugin = ctx.uiFramework === 'compose' ? `
    id("org.jetbrains.kotlin.plugin.compose") version "${ctx.gradle.kotlinVersion || GRADLE_VERSIONS.KOTLIN}" apply false` : '';
    const kaptPlugin = ctx.language === 'kotlin' ? `
    id("org.jetbrains.kotlin.kapt") version "${ctx.gradle.kotlinVersion || GRADLE_VERSIONS.KOTLIN}" apply false` : '';
    return {
        path: 'build.gradle.kts',
        content: `plugins {
    id("com.android.application") version "${ctx.gradle.agpVersion}" apply false${kotlinPlugin}${composePlugin}${kaptPlugin}
}
`
    };
}
function generateGradleProperties(_ctx) {
    return {
        path: 'gradle.properties',
        content: `# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configureondemand=true

# Android settings
android.useAndroidX=true
android.nonTransitiveRClass=true
android.suppressUnsupportedCompileSdk=36

# Kotlin settings
kotlin.code.style=official
`
    };
}
function generateGitIgnore(_ctx) {
    return {
        path: '.gitignore',
        content: `# Built application files
*.apk
*.ap_
*.aab
*.dex
*.class
bin/
gen/
out/
.gradle/
build/
local.properties
proguard/
*.log
.navigation/
captures/
*.iml
.idea/
*.jks
*.keystore
.externalNativeBuild
.cxx/
google-services.json
vcs.xml
`
    };
}
function generateReadme(ctx) {
    const lang = ctx.language === 'kotlin' ? 'Kotlin' : 'Java';
    const ui = ctx.uiFramework === 'compose' ? 'Jetpack Compose' : 'XML Layouts';
    return {
        path: 'README.md',
        content: `# ${ctx.appName}

An Android application built with ${lang} using ${ui}.

## Requirements
- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 or later
- Android SDK API ${ctx.android.targetSdk}
- Gradle ${ctx.gradle.gradleVersion}

## Getting Started
1. Open the project in Android Studio
2. Sync Gradle files
3. Build and run

## License
MIT License
`
    };
}
function generateGradleWrapperProperties(ctx) {
    return {
        path: 'gradle/wrapper/gradle-wrapper.properties',
        content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-${ctx.gradle.gradleVersion}-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
    };
}
function generateGradlewBat(_ctx) {
    return {
        path: 'gradlew.bat',
        content: `@echo off
setlocal enabledelayedexpansion
set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"
set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if %ERRORLEVEL% equ 0 goto execute
echo ERROR: JAVA_HOME is not set
goto fail
:execute
set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
:end
if %ERRORLEVEL% equ 0 goto mainEnd
:fail
exit /b 1
:mainEnd
endlocal
`
    };
}
function generateGradlewUnix(_ctx) {
    return {
        path: 'gradlew',
        content: `#!/bin/sh

APP_HOME=$(dirname "$(cd "$(dirname "$0")" && pwd)")
CLASSPATH="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"
JAVA_HOME="${'$'}{JAVA_HOME:-}"
JAVACMD="${'$'}{JAVACMD:-java}"

if [ ! -x "$JAVACMD" ] && [ -n "$JAVA_HOME" ]; then
    JAVACMD="$JAVA_HOME/bin/java"
fi

if [ ! -x "$JAVACMD" ]; then
    echo "ERROR: JAVA_HOME is not set and no 'java' command could be found"
    exit 1
fi

DEFAULT_JVM_OPTS="-Xmx64m -Xms64m"

exec "$JAVACMD" $DEFAULT_JVM_OPTS $JAVA_OPTS $GRADLE_OPTS "-Dorg.gradle.appname=$(basename "$0")" -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
`
    };
}
function generateAppBuildGradle(ctx) {
    const isCompose = ctx.uiFramework === 'compose';
    const isKotlin = ctx.language === 'kotlin';
    let plugins = 'plugins {\n    id("com.android.application")\n';
    if (isKotlin) {
        plugins += '    id("org.jetbrains.kotlin.android")\n';
        if (isCompose) {
            plugins += '    id("org.jetbrains.kotlin.plugin.compose")\n';
        }
    }
    plugins += '}\n';
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
    if (isCompose) {
        config += `    buildFeatures {
        compose = true
    }
`;
    }
    config += `    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
`;
    if (isCompose) {
        config += `    implementation(platform("androidx.compose:compose-bom:2025.01.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
`;
    }
    else {
        config += `    implementation("androidx.activity:activity-ktx:1.9.2")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.5")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.5")
`;
    }
    // Add native C++ configuration if needed
    if (ctx.template === 'native-cpp') {
        const ndkVersion = ctx.nativeCpp?.ndkVersion ?? '28.2.13676358';
        const abiFilters = ctx.nativeCpp?.abiFilters?.join(', ') ?? '"armeabi-v7a", "arm64-v8a", "x86", "x86_64"';
        config = config.replace('kotlinOptions {', `externalNativeBuild {
        cmake {
            cppFlags += "-std=c++17"
            arguments += "-DANDROID_STL=c++_static"
        }
    }

    ndk {
        abiFilters += [${abiFilters.split(', ').map((a) => `"${a.replace(/"/g, '')}"`).join(', ')}]
    }

    kotlinOptions {`);
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
function generateAppProguardRules(_ctx) {
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
function generateAppManifest(ctx) {
    const activityClass = ctx.language === 'kotlin' ? 'MainActivity' : '.MainActivity';
    return {
        path: 'app/src/main/AndroidManifest.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.${ctx.appNamePascal}">

        <activity
            android:name="${activityClass}"
            android:exported="true"
            android:theme="@style/Theme.${ctx.appNamePascal}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
`
    };
}
function generateApplicationClass(ctx) {
    const packagePath = ctx.packagePath;
    const className = `${ctx.appNamePascal}Application`;
    if (ctx.language === 'kotlin') {
        return {
            path: `app/src/main/kotlin/${packagePath}/${className}.kt`,
            content: `package ${ctx.packageName}

import android.app.Application

class ${className} : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
`
        };
    }
    else {
        return {
            path: `app/src/main/java/${packagePath}/${className}.java`,
            content: `package ${ctx.packageName};

import android.app.Application;

public class ${className} extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
    }
}
`
        };
    }
}
function generateMainActivity(ctx) {
    const packagePath = ctx.packagePath;
    if (ctx.uiFramework === 'compose' && ctx.language === 'kotlin') {
        return {
            path: `app/src/main/kotlin/${packagePath}/MainActivity.kt`,
            content: `package ${ctx.packageName}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ${ctx.packageName}.ui.theme.${ctx.appNamePascal}Theme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ${ctx.appNamePascal}Theme {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    var count by remember { mutableIntStateOf(0) }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .safeDrawingPadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "${ctx.appNamePascal}",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground,
                fontWeight = FontWeight.SemiBold
            )

            Text(
                text = "$count",
                style = MaterialTheme.typography.displayLarge,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(vertical = 32.dp)
            )

            Card(
                onClick = { count++ },
                modifier = Modifier.size(120.dp),
                shape = RoundedCornerShape(60.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "+",
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                }
            }

            Text(
                text = "Tap button to count",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 24.dp)
            )
        }
    }
}
`
        };
    }
    if (ctx.language === 'kotlin') {
        return {
            path: `app/src/main/kotlin/${packagePath}/MainActivity.kt`,
            content: `package ${ctx.packageName}

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import ${ctx.packageName}.R

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enable edge-to-edge
        WindowCompat.setDecorFitsSystemWindows(window, false)

        setContentView(R.layout.activity_main)

        // Apply window insets for edge-to-edge
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content)) { view, windowInsets ->
            val insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.updatePadding(
                left = insets.left,
                right = insets.right
            )
            windowInsets
        }
    }
}
`
        };
    }
    return {
        path: `app/src/main/java/${packagePath}/MainActivity.java`,
        content: `package ${ctx.packageName};

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import ${ctx.packageName}.R;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable edge-to-edge
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        setContentView(R.layout.activity_main);

        // Apply window insets for edge-to-edge
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (view, windowInsets) -> {
            var insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            view.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
    }
}
`
    };
}
function generateStrings(ctx) {
    const displayName = ctx.appName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
        path: 'app/src/main/res/values/strings.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${displayName}</string>
    <string name="app_name_short">${ctx.appNamePascal}</string>
    <string name="content_description_app_icon">Application icon</string>
</resources>
`
    };
}
function generateColors(_ctx) {
    return {
        path: 'app/src/main/res/values/colors.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Primary Colors -->
    <color name="primary">#6750A4</color>
    <color name="primary_variant">#7F67BE</color>
    <color name="on_primary">#FFFFFF</color>

    <!-- Secondary Colors -->
    <color name="secondary">#625B71</color>
    <color name="secondary_variant">#7A7289</color>
    <color name="on_secondary">#FFFFFF</color>

    <!-- Tertiary Colors -->
    <color name="tertiary">#7D5260</color>
    <color name="on_tertiary">#FFFFFF</color>

    <!-- Background Colors -->
    <color name="background">#FFFBFE</color>
    <color name="on_background">#1C1B1F</color>
    <color name="surface">#FFFBFE</color>
    <color name="on_surface">#1C1B1F</color>

    <!-- Status Colors -->
    <color name="error">#B3261E</color>
    <color name="on_error">#FFFFFF</color>
    <color name="outline">#79747E</color>

    <!-- Icon Colors -->
    <color name="ic_launcher_background">#6750A4</color>
</resources>
`
    };
}
function generateThemes(ctx) {
    const themeName = `Theme.${ctx.appNamePascal}`;
    if (ctx.uiFramework === 'compose') {
        return {
            path: 'app/src/main/res/values/themes.xml',
            content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="${themeName}" parent="Theme.Material3.Light.NoActionBar">
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:windowLightNavigationBar">true</item>
    </style>
</resources>
`
        };
    }
    return {
        path: 'app/src/main/res/values/themes.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="${themeName}" parent="Theme.Material3.Light.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorOnPrimary">@color/on_primary</item>
        <item name="colorPrimaryContainer">@color/primary_variant</item>
        <item name="colorSecondary">@color/secondary</item>
        <item name="colorOnSecondary">@color/on_secondary</item>
        <item name="colorTertiary">@color/tertiary</item>
        <item name="colorOnTertiary">@color/on_tertiary</item>
        <item name="android:colorBackground">@color/background</item>
        <item name="colorOnBackground">@color/on_background</item>
        <item name="colorSurface">@color/surface</item>
        <item name="colorOnSurface">@color/on_surface</item>
        <item name="colorError">@color/error</item>
        <item name="colorOnError">@color/on_error</item>
        <item name="colorOutline">@color/outline</item>
        <item name="android:statusBarColor">@color/surface</item>
        <item name="android:navigationBarColor">@color/surface</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:windowLightNavigationBar">true</item>
    </style>
</resources>
`
    };
}
function generateAppIcon(_ctx) {
    return {
        path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
`
    };
}
function generateActivityLayout(ctx) {
    if (ctx.uiFramework === 'compose') {
        return {
            path: 'app/src/main/res/layout/activity_main.xml',
            content: `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/background">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:text="@string/app_name"
        android:textAppearance="?attr/textAppearanceHeadlineMedium"
        android:textColor="@color/on_background" />

</FrameLayout>
`
        };
    }
    return {
        path: 'app/src/main/res/layout/activity_main.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/background"
    tools:context=".MainActivity">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/app_name"
        android:textAppearance="?attr/textAppearanceHeadlineMedium"
        android:textColor="@color/on_background"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <com.google.android.material.floatingactionbutton.FloatingActionButton
        android:id="@+id/fab"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_margin="16dp"
        android:contentDescription="@string/app_name_short"
        android:src="@drawable/ic_add"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:tint="@color/on_primary" />

</androidx.constraintlayout.widget.ConstraintLayout>
`
    };
}
function generateSourceSetFiles(ctx) {
    const files = [];
    const packagePath = ctx.packagePath;
    // Professional adaptive icon background
    files.push({
        path: 'app/src/main/res/drawable/ic_launcher_background.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#6750A4"
        android:pathData="M0,0h108v108h-108z"/>
</vector>
`
    });
    // Professional icon foreground - Android robot stylized "A"
    files.push({
        path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Android robot head stylized as "A" -->
    <group android:translateX="27" android:translateY="27">
        <!-- Circle background -->
        <path
            android:fillColor="#FFFFFF"
            android:pathData="M27,27m-24,0a24,24 0,1 1,48 0a24,24 0,1 1,-48 0"/>
        <!-- A shape -->
        <path
            android:fillColor="#6750A4"
            android:pathData="M27,42L17,22h4l6,12 6,-12h4L27,42zM24,35l2.5,-5 2.5,5h-5z"/>
        <!-- Antenna -->
        <path
            android:strokeColor="#6750A4"
            android:strokeWidth="2"
            android:pathData="M20,18L12,10"/>
        <path
            android:strokeColor="#6750A4"
            android:strokeWidth="2"
            android:pathData="M34,18L42,10"/>
    </group>
</vector>
`
    });
    files.push({
        path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
`
    });
    // Add icon for FAB
    files.push({
        path: 'app/src/main/res/drawable/ic_add.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
</vector>
`
    });
    if (ctx.uiFramework === 'compose') {
        files.push({
            path: `app/src/main/kotlin/${packagePath}/ui/theme/Color.kt`,
            content: `package ${ctx.packageName}.ui.theme

import androidx.compose.ui.graphics.Color

// Light theme primary colors
val Purple40 = Color(0xFF6750A4)
val PurpleGrey40 = Color(0xFF625B71)
val Pink40 = Color(0xFF7D5260)

// Dark theme primary colors
val Purple80 = Color(0xFFD0BCFF)
val PurpleGrey80 = Color(0xFFCCC2DC)
val Pink80 = Color(0xFFEFB8C8)

// Custom brand colors
val Teal40 = Color(0xFF006B5B)
val Teal80 = Color(0xFF8BD8CE)
`
        });
        files.push({
            path: `app/src/main/kotlin/${packagePath}/ui/theme/Theme.kt`,
            content: `package ${ctx.packageName}.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    onPrimary = Color(0xFF381E72),
    primaryContainer = Color(0xFF4F378B),
    onPrimaryContainer = Color(0xFFEADDFF),
    secondary = PurpleGrey80,
    onSecondary = Color(0xFF332D41),
    secondaryContainer = Color(0xFF4A4458),
    onSecondaryContainer = Color(0xFFE8DEF8),
    tertiary = Pink80,
    onTertiary = Color(0xFF492532),
    tertiaryContainer = Color(0xFF633B48),
    onTertiaryContainer = Color(0xFFFFD8E4),
    background = Color(0xFF1C1B1F),
    onBackground = Color(0xFFE6E1E5),
    surface = Color(0xFF1C1B1F),
    onSurface = Color(0xFFE6E1E5),
    surfaceVariant = Color(0xFF49454F),
    onSurfaceVariant = Color(0xFFCAC4D0)
)

private val LightColorScheme = lightColorScheme(
    primary = Purple40,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFEADDFF),
    onPrimaryContainer = Color(0xFF21005D),
    secondary = PurpleGrey40,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE8DEF8),
    onSecondaryContainer = Color(0xFF1D192B),
    tertiary = Pink40,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFD8E4),
    onTertiaryContainer = Color(0xFF31111D),
    background = Color(0xFFFFFBFE),
    onBackground = Color(0xFF1C1B1F),
    surface = Color(0xFFFFFBFE),
    onSurface = Color(0xFF1C1B1F),
    surfaceVariant = Color(0xFFE7E0EC),
    onSurfaceVariant = Color(0xFF49454F)
)

@Composable
fun ${ctx.appNamePascal}Theme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (darkTheme) dynamicDarkColorScheme(LocalView.current.context) else dynamicLightColorScheme(LocalView.current.context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = Color.Transparent.toArgb()
            window.navigationBarColor = Color.Transparent.toArgb()
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = !darkTheme
                isAppearanceLightNavigationBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
`
        });
        files.push({
            path: `app/src/main/kotlin/${packagePath}/ui/theme/Type.kt`,
            content: `package ${ctx.packageName}.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Typography = Typography(
    displayLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 57.sp,
        lineHeight = 64.sp,
        letterSpacing = (-0.25).sp
    ),
    displayMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 45.sp,
        lineHeight = 52.sp,
        letterSpacing = 0.sp
    ),
    displaySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 36.sp,
        lineHeight = 44.sp,
        letterSpacing = 0.sp
    ),
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 32.sp,
        lineHeight = 40.sp,
        letterSpacing = 0.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = 0.sp
    ),
    headlineSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp,
        lineHeight = 32.sp,
        letterSpacing = 0.sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.15.sp
    ),
    titleSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.25.sp
    ),
    bodySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.4.sp
    ),
    labelLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
)
`
        });
    }
    return files;
}
function isKotlinActivity(ctx) {
    return ctx.language === 'kotlin';
}
function getAndroidVersionName(apiLevel) {
    const versions = {
        35: '15', 34: '14', 33: '13', 32: '12L', 31: '12',
        30: '11', 29: '10', 28: '9', 27: '8.1', 26: '8.0', 24: '7.0', 21: '5.0'
    };
    return versions[apiLevel] || 'Unknown';
}
/**
 * Get directory contents
 */
export async function getDirectoryContents(path) {
    try {
        const items = await import('fs-extra').then(fse => fse.default.readdir(path));
        return items;
    }
    catch (error) {
        return [];
    }
}
//# sourceMappingURL=generator.js.map