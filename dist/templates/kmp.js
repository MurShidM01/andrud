/**
 * Kotlin Multiplatform (KMP) & Compose Multiplatform cross-platform file generators
 * Follows the official Kotlin CLI / JetBrains Amper multiplatform project layout:
 * - Root: `project.yaml`, `libs.versions.toml`, `kotlin`, `kotlin.bat`, `README.md`, `.gitignore`
 * - `shared/`: `module.yaml`, `composeResources/drawable/compose-multiplatform.xml`,
 *   `src/{App,Greeting,Platform}.kt`, `src@{android,ios,jvm,wasmJs}/Platform.*.kt`,
 *   `test/PlatformTest.kt`, `test@{android,ios,jvm,wasmJs}/Platform*Test.kt`
 * - `androidApp/`: `module.yaml`, `proguard-rules.pro`, `res/...`, `src/{AndroidManifest.xml,MainActivity.kt}`
 * - `desktopApp/`: `module.yaml`, `resources/logback.xml`, `src/main.kt`
 * - `iosApp/`: `module.yaml`, `module.xcodeproj/...`, `src/{Assets.xcassets,Info.plist,ViewController.kt,iosApp.swift}`
 * - `webApp/`: `module.yaml`, `resources/{index.html,styles.css}`, `src/main.kt`
 */
import { deflateSync } from 'zlib';
import { GRADLE_VERSIONS, ANDROIDX_VERSIONS, DEFAULT_KMP_PLATFORMS } from '../core/config.js';
import { generateAppProguardRules } from './gradle.js';
const PNG_CACHE = new Map();
const CRC32_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
    }
    return table;
})();
function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}
function makePngChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcInput = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(crcInput), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
}
/**
 * Generates a valid, standards-compliant indexed-color PNG icon buffer of the given dimensions.
 */
function createLauncherPngBuffer(width, height, rgb = [0x67, 0x50, 0xa4]) {
    const cacheKey = `${width}x${height}:${rgb.join(',')}`;
    const cached = PNG_CACHE.get(cacheKey);
    if (cached) {
        return cached;
    }
    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    // IHDR: width, height, bitDepth=8, colorType=3 (indexed palette), compression=0, filter=0, interlace=0
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 3;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;
    // PLTE: 1 palette entry with brand primary color
    const plte = Buffer.from(rgb);
    // Raw scanlines: each scanline starts with filter byte 0 followed by `width` palette index 0 bytes
    const rawScanlines = Buffer.alloc(height * (width + 1), 0);
    const idatData = deflateSync(rawScanlines, { level: 9 });
    const png = Buffer.concat([
        signature,
        makePngChunk('IHDR', ihdr),
        makePngChunk('PLTE', plte),
        makePngChunk('IDAT', idatData),
        makePngChunk('IEND', Buffer.alloc(0))
    ]);
    PNG_CACHE.set(cacheKey, png);
    return png;
}
export function getKmpPlatforms(ctx) {
    return ctx.kmp?.platforms && ctx.kmp.platforms.length > 0
        ? ctx.kmp.platforms
        : [...DEFAULT_KMP_PLATFORMS];
}
export function getKmpDirectories(ctx) {
    if (ctx.template !== 'kotlin-multiplatform') {
        return [];
    }
    const platforms = getKmpPlatforms(ctx);
    const dirs = [
        'shared/composeResources/drawable',
        'shared/src',
        'shared/test'
    ];
    if (platforms.includes('android')) {
        dirs.push('shared/src@android', 'shared/test@android', 'androidApp/res/drawable', 'androidApp/res/drawable-v24', 'androidApp/res/mipmap-anydpi-v26', 'androidApp/res/mipmap-hdpi', 'androidApp/res/mipmap-mdpi', 'androidApp/res/mipmap-xhdpi', 'androidApp/res/mipmap-xxhdpi', 'androidApp/res/mipmap-xxxhdpi', 'androidApp/res/values', 'androidApp/src');
    }
    if (platforms.includes('desktop')) {
        dirs.push('shared/src@jvm', 'shared/test@jvm', 'desktopApp/resources', 'desktopApp/src');
    }
    if (platforms.includes('ios')) {
        dirs.push('shared/src@ios', 'shared/test@ios');
        if (ctx.kmp?.includeIosApp !== false) {
            dirs.push('iosApp/module.xcodeproj/xcshareddata/xcschemes', 'iosApp/src/Assets.xcassets/AppIcon.appiconset');
        }
    }
    if (platforms.includes('wasmJs')) {
        dirs.push('shared/src@wasmJs', 'shared/test@wasmJs', 'webApp/resources', 'webApp/src');
    }
    return dirs;
}
export function generateKmpProjectYaml(ctx) {
    const platforms = getKmpPlatforms(ctx);
    const modules = ['  - shared'];
    if (platforms.includes('android')) {
        modules.push('  - androidApp');
    }
    if (platforms.includes('ios') && ctx.kmp?.includeIosApp !== false) {
        modules.push('  - iosApp');
    }
    if (platforms.includes('desktop')) {
        modules.push('  - desktopApp');
    }
    if (platforms.includes('wasmJs')) {
        modules.push('  - webApp');
    }
    return {
        path: 'project.yaml',
        content: `modules:\n${modules.join('\n')}\n`
    };
}
export function generateKmpVersionCatalog(ctx) {
    const kotlinVersion = ctx.gradle.kotlinVersion || GRADLE_VERSIONS.KOTLIN;
    const cmpVersion = ctx.kmp?.composeMultiplatformVersion ||
        ctx.gradle.composeMultiplatformVersion ||
        GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM;
    const coroutinesVersion = ctx.kmp?.coroutinesVersion || GRADLE_VERSIONS.KOTLINX_COROUTINES;
    const serializationVersion = ctx.kmp?.serializationVersion || GRADLE_VERSIONS.KOTLINX_SERIALIZATION;
    return {
        path: 'libs.versions.toml',
        content: `[versions]
agp = "${ctx.gradle.agpVersion}"
kotlin = "${kotlinVersion}"
compose-multiplatform = "${cmpVersion}"
kotlinx-coroutines = "${coroutinesVersion}"
kotlinx-serialization = "${serializationVersion}"
androidx-core-ktx = "${ANDROIDX_VERSIONS.CORE_KTX}"
androidx-appcompat = "${ANDROIDX_VERSIONS.APP_COMPAT}"
androidx-activityCompose = "${ANDROIDX_VERSIONS.ACTIVITY}"
androidx-lifecycle = "${ANDROIDX_VERSIONS.LIFECYCLE}"
android-compileSdk = "${ctx.android.compileSdk}"
android-minSdk = "${ctx.android.minSdk}"
android-targetSdk = "${ctx.android.targetSdk}"
logback = "1.5.16"

[libraries]
kotlin-test = { module = "org.jetbrains.kotlin:kotlin-test", version.ref = "kotlin" }
kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
kotlinx-coroutines-swing = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-swing", version.ref = "kotlinx-coroutines" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinx-serialization" }
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "androidx-core-ktx" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "androidx-appcompat" }
androidx-activity-compose = { module = "androidx.activity:activity-compose", version.ref = "androidx-activityCompose" }
androidx-lifecycle-viewmodel = { group = "org.jetbrains.androidx.lifecycle", name = "lifecycle-viewmodel", version.ref = "androidx-lifecycle" }
androidx-lifecycle-runtime-compose = { group = "org.jetbrains.androidx.lifecycle", name = "lifecycle-runtime-compose", version.ref = "androidx-lifecycle" }
logback-classic = { module = "ch.qos.logback:logback-classic", version.ref = "logback" }

[plugins]
androidApplication = { id = "com.android.application", version.ref = "agp" }
androidLibrary = { id = "com.android.library", version.ref = "agp" }
kotlinAndroid = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlinMultiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
composeMultiplatform = { id = "org.jetbrains.compose", version.ref = "compose-multiplatform" }
composeCompiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
kotlinSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
`
    };
}
export function generateKotlinCliUnixWrapper(_ctx) {
    return {
        path: 'kotlin',
        executable: true,
        content: `#!/bin/sh
#
# Official Kotlin Multiplatform / Amper CLI wrapper script for POSIX systems
#

set -eu

AMPER_VERSION="0.5.0"
AMPER_CACHE_DIR="\${HOME}/.amper"
AMPER_DIST_DIR="\${AMPER_CACHE_DIR}/amper-cli-\${AMPER_VERSION}"
AMPER_BIN="\${AMPER_DIST_DIR}/bin/amper"

if [ ! -x "\${AMPER_BIN}" ]; then
  mkdir -p "\${AMPER_DIST_DIR}"
  AMPER_URL="https://packages.jetbrains.team/maven/p/amper/amper/org/jetbrains/amper/cli/\${AMPER_VERSION}/cli-\${AMPER_VERSION}-dist.tgz"
  echo "Downloading Kotlin Multiplatform CLI (\${AMPER_VERSION})..."
  if command -v curl >/dev/null 2>&1; then
    curl -fSL "\${AMPER_URL}" | tar -xz -C "\${AMPER_DIST_DIR}"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- "\${AMPER_URL}" | tar -xz -C "\${AMPER_DIST_DIR}"
  else
    echo "Error: curl or wget is required to download the Kotlin CLI wrapper." >&2
    exit 1
  fi
fi

exec "\${AMPER_BIN}" "$@"
`
    };
}
export function generateKotlinCliWindowsWrapper(_ctx) {
    return {
        path: 'kotlin.bat',
        content: `@echo off
rem Official Kotlin Multiplatform / Amper CLI wrapper script for Windows
setlocal

set AMPER_VERSION=0.5.0
set AMPER_CACHE_DIR=%USERPROFILE%\\.amper
set AMPER_DIST_DIR=%AMPER_CACHE_DIR%\\amper-cli-%AMPER_VERSION%
set AMPER_BIN=%AMPER_DIST_DIR%\\bin\\amper.bat

if not exist "%AMPER_BIN%" (
    if not exist "%AMPER_DIST_DIR%" mkdir "%AMPER_DIST_DIR%"
    echo Downloading Kotlin Multiplatform CLI ^(%AMPER_VERSION%^)...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://packages.jetbrains.team/maven/p/amper/amper/org/jetbrains/amper/cli/%AMPER_VERSION%/cli-%AMPER_VERSION%-dist.zip' -OutFile '%AMPER_DIST_DIR%\\amper.zip'; Expand-Archive -Path '%AMPER_DIST_DIR%\\amper.zip' -DestinationPath '%AMPER_DIST_DIR%' -Force; Remove-Item '%AMPER_DIST_DIR%\\amper.zip'"
)

call "%AMPER_BIN%" %*
endlocal
`
    };
}
export function generateKmpSharedModuleYaml(ctx) {
    const platforms = getKmpPlatforms(ctx);
    const targetList = [];
    if (platforms.includes('android')) {
        targetList.push('    - android');
    }
    if (platforms.includes('ios')) {
        targetList.push('    - iosArm64', '    - iosSimulatorArm64', '    - iosX64');
    }
    if (platforms.includes('desktop')) {
        targetList.push('    - jvm');
    }
    if (platforms.includes('wasmJs')) {
        targetList.push('    - wasmJs');
    }
    return {
        path: 'shared/module.yaml',
        content: `product:
  type: lib
  platforms:
${targetList.join('\n')}

dependencies:
  - $compose.runtime
  - $compose.foundation
  - $compose.material3
  - $compose.ui
  - $compose.components.resources
  - $compose.components.uiToolingPreview
  - $libs.androidx.lifecycle.viewmodel
  - $libs.androidx.lifecycle.runtime.compose
  - $libs.kotlinx.coroutines.core
  - $libs.kotlinx.serialization.json

test-dependencies:
  - $kotlin.test

settings:
  kotlin:
    serialization: json
  compose:
    enabled: true
    resources:
      packageName: ${ctx.packageName}.shared.generated.resources
  android:
    namespace: ${ctx.packageName}.shared
    compileSdk: ${ctx.android.compileSdk}
    minSdk: ${ctx.android.minSdk}
`
    };
}
export const generateKmpSharedBuildGradle = generateKmpSharedModuleYaml;
export function generateComposeMultiplatformDrawable() {
    return {
        path: 'shared/composeResources/drawable/compose-multiplatform.xml',
        content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#6750A4"
        android:pathData="M54,12L90,33V75L54,96L18,75V33L54,12Z" />
    <path
        android:fillColor="#D0BCFF"
        android:pathData="M54,28L76,41V67L54,80L32,67V41L54,28Z" />
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M54,42L64,48V60L54,66L44,60V48L54,42Z" />
</vector>
`
    };
}
export function generateKmpFiles(ctx) {
    if (ctx.template !== 'kotlin-multiplatform') {
        return [];
    }
    const platforms = getKmpPlatforms(ctx);
    const files = [
        generateKotlinCliUnixWrapper(ctx),
        generateKotlinCliWindowsWrapper(ctx),
        generateKmpVersionCatalog(ctx),
        generateKmpProjectYaml(ctx),
        generateComposeMultiplatformDrawable(),
        generateKmpSharedModuleYaml(ctx),
        // =========================================================================
        // Shared Cross-Platform Sources (`shared/src/`) & Tests (`shared/test/`)
        // =========================================================================
        {
            path: 'shared/src/App.kt',
            content: `package ${ctx.packageName}

import androidx.compose.foundation.isSystemInDarkTheme
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
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Purple40 = Color(0xFF6750A4)
private val PurpleGrey40 = Color(0xFF625B71)
private val Pink40 = Color(0xFF7D5260)

private val Purple80 = Color(0xFFD0BCFF)
private val PurpleGrey80 = Color(0xFFCCC2DC)
private val Pink80 = Color(0xFFEFB8C8)

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

private val AppTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 57.sp,
        lineHeight = 64.sp,
        letterSpacing = (-0.25).sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = 0.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.25.sp
    )
)

@Composable
fun ${ctx.appNamePascal}Theme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = AppTypography,
        content = content
    )
}

@Composable
fun App() {
    ${ctx.appNamePascal}Theme {
        var count by remember { mutableIntStateOf(0) }
        val greeting = remember { Greeting().greet() }

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
                    text = greeting,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 8.dp)
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
}
`
        },
        {
            path: 'shared/src/Greeting.kt',
            content: `package ${ctx.packageName}

class Greeting {
    private val platform: Platform = getPlatform()

    fun greet(): String {
        return "Hello, \${platform.name}!"
    }
}
`
        },
        {
            path: 'shared/src/Platform.kt',
            content: `package ${ctx.packageName}

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform
`
        },
        {
            path: 'shared/test/PlatformTest.kt',
            content: `package ${ctx.packageName}

import kotlin.test.Test
import kotlin.test.assertTrue

class PlatformTest {
    @Test
    fun testGreetingIsNotEmpty() {
        val message = Greeting().greet()
        assertTrue(message.isNotEmpty(), "Check Greeting is not empty")
        assertTrue(message.contains("Hello,"), "Check Greeting prefix")
    }
}
`
        }
    ];
    // ===========================================================================
    // Android Target (`shared/src@android`, `shared/test@android`, `androidApp/`)
    // ===========================================================================
    if (platforms.includes('android')) {
        files.push({
            path: 'shared/src@android/Platform.android.kt',
            content: `package ${ctx.packageName}

import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android \${Build.VERSION.SDK_INT}"
}

actual fun getPlatform(): Platform = AndroidPlatform()
`
        }, {
            path: 'shared/test@android/PlatformAndroidTest.kt',
            content: `package ${ctx.packageName}

import kotlin.test.Test
import kotlin.test.assertTrue

class PlatformAndroidTest {
    @Test
    fun testAndroidPlatform() {
        assertTrue(getPlatform().name.contains("Android"), "Check Android is mentioned")
    }
}
`
        }, {
            path: 'androidApp/module.yaml',
            content: `product: android/app

dependencies:
  - ../shared
  - $compose.runtime
  - $compose.foundation
  - $compose.material3
  - $compose.ui
  - $compose.uiTooling
  - $libs.androidx.core.ktx
  - $libs.androidx.activity.compose

settings:
  compose: enabled
  android:
    namespace: ${ctx.packageName}
    applicationId: ${ctx.packageName}
    compileSdk: ${ctx.android.compileSdk}
    minSdk: ${ctx.android.minSdk}
    targetSdk: ${ctx.android.targetSdk}
    versionCode: 1
    versionName: "1.0"
`
        }, {
            path: 'androidApp/proguard-rules.pro',
            content: generateAppProguardRules(ctx).content
        }, {
            path: 'androidApp/res/drawable/ic_launcher_background.xml',
            content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#6750A4"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`
        }, {
            path: 'androidApp/res/drawable-v24/ic_launcher_foreground.xml',
            content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M54,36 L54,72 M36,54 L72,54"
        android:strokeWidth="8"
        android:strokeColor="#FFFFFF"
        android:strokeLineCap="round" />
</vector>
`
        }, {
            path: 'androidApp/res/mipmap-anydpi-v26/ic_launcher.xml',
            content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
        }, {
            path: 'androidApp/res/mipmap-anydpi-v26/ic_launcher_round.xml',
            content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
        }, {
            path: 'androidApp/res/mipmap-mdpi/ic_launcher.png',
            content: createLauncherPngBuffer(48, 48)
        }, {
            path: 'androidApp/res/mipmap-mdpi/ic_launcher_round.png',
            content: createLauncherPngBuffer(48, 48)
        }, {
            path: 'androidApp/res/mipmap-hdpi/ic_launcher.png',
            content: createLauncherPngBuffer(72, 72)
        }, {
            path: 'androidApp/res/mipmap-hdpi/ic_launcher_round.png',
            content: createLauncherPngBuffer(72, 72)
        }, {
            path: 'androidApp/res/mipmap-xhdpi/ic_launcher.png',
            content: createLauncherPngBuffer(96, 96)
        }, {
            path: 'androidApp/res/mipmap-xhdpi/ic_launcher_round.png',
            content: createLauncherPngBuffer(96, 96)
        }, {
            path: 'androidApp/res/mipmap-xxhdpi/ic_launcher.png',
            content: createLauncherPngBuffer(144, 144)
        }, {
            path: 'androidApp/res/mipmap-xxhdpi/ic_launcher_round.png',
            content: createLauncherPngBuffer(144, 144)
        }, {
            path: 'androidApp/res/mipmap-xxxhdpi/ic_launcher.png',
            content: createLauncherPngBuffer(192, 192)
        }, {
            path: 'androidApp/res/mipmap-xxxhdpi/ic_launcher_round.png',
            content: createLauncherPngBuffer(192, 192)
        }, {
            path: 'androidApp/res/values/strings.xml',
            content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${ctx.appName}</string>
</resources>
`
        }, {
            path: 'androidApp/src/AndroidManifest.xml',
            content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden|mnc|colorMode|density|fontScale|fontWeightAdjustment|keyboard|layoutDirection|locale|mcc|navigation|smallestScreenSize|touchscreen|uiMode">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
        }, {
            path: 'androidApp/src/MainActivity.kt',
            content: `package ${ctx.packageName}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            App()
        }
    }
}
`
        });
    }
    // ===========================================================================
    // Desktop JVM Target (`shared/src@jvm`, `shared/test@jvm`, `desktopApp/`)
    // ===========================================================================
    if (platforms.includes('desktop')) {
        files.push({
            path: 'shared/src@jvm/Platform.jvm.kt',
            content: `package ${ctx.packageName}

class JVMPlatform : Platform {
    override val name: String = "Java \${System.getProperty("java.version")}"
}

actual fun getPlatform(): Platform = JVMPlatform()
`
        }, {
            path: 'shared/test@jvm/PlatformJvmTest.kt',
            content: `package ${ctx.packageName}

import kotlin.test.Test
import kotlin.test.assertTrue

class PlatformJvmTest {
    @Test
    fun testJvmPlatform() {
        assertTrue(getPlatform().name.contains("Java"), "Check Java is mentioned")
    }
}
`
        }, {
            path: 'desktopApp/module.yaml',
            content: `product: jvm/app

dependencies:
  - ../shared
  - $compose.desktop.currentOs
  - $libs.kotlinx.coroutines.swing
  - $libs.logback.classic

settings:
  compose: enabled
  jvm:
    mainClass: ${ctx.packageName}.MainKt
`
        }, {
            path: 'desktopApp/resources/logback.xml',
            content: `<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
`
        }, {
            path: 'desktopApp/src/main.kt',
            content: `package ${ctx.packageName}

import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "${ctx.appName}",
        state = rememberWindowState(width = 480.dp, height = 760.dp)
    ) {
        App()
    }
}
`
        });
    }
    // ===========================================================================
    // iOS Target (`shared/src@ios`, `shared/test@ios`, `iosApp/`)
    // ===========================================================================
    if (platforms.includes('ios')) {
        files.push({
            path: 'shared/src@ios/Platform.ios.kt',
            content: `package ${ctx.packageName}

import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String =
        UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}

actual fun getPlatform(): Platform = IOSPlatform()
`
        }, {
            path: 'shared/test@ios/PlatformIosTest.kt',
            content: `package ${ctx.packageName}

import kotlin.test.Test
import kotlin.test.assertTrue

class PlatformIosTest {
    @Test
    fun testIosPlatform() {
        assertTrue(
            getPlatform().name.contains("iOS") || getPlatform().name.contains("iPadOS"),
            "Check iOS is mentioned"
        )
    }
}
`
        });
        if (ctx.kmp?.includeIosApp !== false) {
            files.push({
                path: 'iosApp/module.yaml',
                content: `product: ios/app

dependencies:
  - ../shared

settings:
  compose: enabled
  ios:
    teamId: ""
`
            }, {
                path: 'iosApp/module.xcodeproj/project.pbxproj',
                content: `// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {
		000000000000000000000001 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 1600;
				LastUpgradeCheck = 1600;
			};
			buildConfigurationList = 000000000000000000000002 /* Build configuration list for PBXProject "module" */;
			compatibilityVersion = "Xcode 14.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
			);
			mainGroup = 000000000000000000000003;
			projectDirPath = "";
			projectRoot = "";
			targets = (
			);
		};
		000000000000000000000002 /* Build configuration list for PBXProject "module" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		000000000000000000000003 = {
			isa = PBXGroup;
			children = (
			);
			sourceTree = "<group>";
		};
	};
	rootObject = 000000000000000000000001 /* Project object */;
}
`
            }, {
                path: 'iosApp/module.xcodeproj/xcshareddata/xcschemes/app.xcscheme',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<Scheme
   LastUpgradeVersion = "1600"
   version = "1.7">
   <BuildAction
      parallelizeBuildables = "YES"
      buildImplicitDependencies = "YES">
   </BuildAction>
   <TestAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      shouldUseLaunchSchemeArgsEnv = "YES">
   </TestAction>
   <LaunchAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      launchStyle = "0"
      useCustomWorkingDirectory = "NO"
      ignoresPersistentStateOnLaunch = "NO"
      debugDocumentVersioning = "YES"
      debugServiceExtension = "internal"
      allowLocationSimulation = "YES">
   </LaunchAction>
</Scheme>
`
            }, {
                path: 'iosApp/src/Assets.xcassets/Contents.json',
                content: `{
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
`
            }, {
                path: 'iosApp/src/Assets.xcassets/AppIcon.appiconset/Contents.json',
                content: `{
  "images" : [
    {
      "filename" : "app-icon-1024.png",
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
`
            }, {
                path: 'iosApp/src/Assets.xcassets/AppIcon.appiconset/app-icon-1024.png',
                content: createLauncherPngBuffer(1024, 1024)
            }, {
                path: 'iosApp/src/Info.plist',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>${ctx.packageName}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${ctx.appName}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>CADisableMinimumFrameDurationOnPhone</key>
    <true/>
    <key>UILaunchScreen</key>
    <dict/>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>
`
            }, {
                path: 'iosApp/src/ViewController.kt',
                content: `package ${ctx.packageName}

import androidx.compose.ui.window.ComposeUIViewController

fun ViewController() = ComposeUIViewController { App() }
`
            }, {
                path: 'iosApp/src/iosApp.swift',
                content: `import SwiftUI
import UIKit
import shared

struct ComposeView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        ViewControllerKt.ViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

struct ContentView: View {
    var body: some View {
        ComposeView()
            .ignoresSafeArea(.all)
    }
}

@main
struct iOSApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
`
            });
        }
    }
    // ===========================================================================
    // Web (Kotlin/Wasm) Target (`shared/src@wasmJs`, `shared/test@wasmJs`, `webApp/`)
    // ===========================================================================
    if (platforms.includes('wasmJs')) {
        files.push({
            path: 'shared/src@wasmJs/Platform.wasmJs.kt',
            content: `package ${ctx.packageName}

class WasmPlatform : Platform {
    override val name: String = "Web with Kotlin/Wasm"
}

actual fun getPlatform(): Platform = WasmPlatform()
`
        }, {
            path: 'shared/test@wasmJs/PlatformWasmJsTest.kt',
            content: `package ${ctx.packageName}

import kotlin.test.Test
import kotlin.test.assertTrue

class PlatformWasmJsTest {
    @Test
    fun testWasmJsPlatform() {
        assertTrue(getPlatform().name.contains("Web"), "Check Web is mentioned")
    }
}
`
        }, {
            path: 'webApp/module.yaml',
            content: `product: wasmJs/app

dependencies:
  - ../shared
  - $compose.runtime
  - $compose.foundation
  - $compose.material3
  - $compose.ui

settings:
  compose: enabled
`
        }, {
            path: 'webApp/resources/index.html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${ctx.appName}</title>
    <link type="text/css" rel="stylesheet" href="styles.css">
    <script type="application/javascript" src="webApp.js"></script>
</head>
<body>
</body>
</html>
`
        }, {
            path: 'webApp/resources/styles.css',
            content: `html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}
`
        }, {
            path: 'webApp/src/main.kt',
            content: `package ${ctx.packageName}

import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.ComposeViewport
import kotlinx.browser.document

@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    val body = document.body ?: return
    ComposeViewport(body) {
        App()
    }
}
`
        });
    }
    return files;
}
//# sourceMappingURL=kmp.js.map