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
import type { TemplateContext, GeneratedFile, KmpPlatform } from '../core/types.js';
import { generateAppProguardRules } from './gradle.js';

const PNG_CACHE = new Map<string, Buffer>();

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

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]!) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePngChunk(type: string, data: Buffer): Buffer {
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
function createLauncherPngBuffer(
  width: number,
  height: number,
  rgb: [number, number, number] = [0x67, 0x50, 0xa4]
): Buffer {
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

export function getKmpPlatforms(ctx: TemplateContext): KmpPlatform[] {
  return ctx.kmp?.platforms && ctx.kmp.platforms.length > 0
    ? ctx.kmp.platforms
    : [...DEFAULT_KMP_PLATFORMS];
}

export function getKmpDirectories(ctx: TemplateContext): string[] {
  if (ctx.template !== 'kotlin-multiplatform') {
    return [];
  }

  const platforms = getKmpPlatforms(ctx);
  const dirs: string[] = [
    'shared/composeResources/drawable',
    'shared/src',
    'shared/test'
  ];

  if (platforms.includes('android')) {
    dirs.push(
      'shared/src@android',
      'shared/test@android',
      'androidApp/res/drawable',
      'androidApp/res/drawable-v24',
      'androidApp/res/mipmap-anydpi-v26',
      'androidApp/res/mipmap-hdpi',
      'androidApp/res/mipmap-mdpi',
      'androidApp/res/mipmap-xhdpi',
      'androidApp/res/mipmap-xxhdpi',
      'androidApp/res/mipmap-xxxhdpi',
      'androidApp/res/values',
      'androidApp/src'
    );
  }

  if (platforms.includes('desktop')) {
    dirs.push(
      'shared/src@jvm',
      'shared/test@jvm',
      'desktopApp/resources',
      'desktopApp/src'
    );
  }

  if (platforms.includes('ios')) {
    dirs.push('shared/src@ios', 'shared/test@ios');
    if (ctx.kmp?.includeIosApp !== false) {
      dirs.push(
        'iosApp/module.xcodeproj/xcshareddata/xcschemes',
        'iosApp/src/Assets.xcassets/AppIcon.appiconset'
      );
    }
  }

  if (platforms.includes('wasmJs')) {
    dirs.push(
      'shared/src@wasmJs',
      'shared/test@wasmJs',
      'webApp/resources',
      'webApp/src'
    );
  }

  return dirs;
}

export function generateKmpProjectYaml(ctx: TemplateContext): GeneratedFile {
  const platforms = getKmpPlatforms(ctx);
  const modules: string[] = ['  - shared'];

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

export function generateKmpVersionCatalog(ctx: TemplateContext): GeneratedFile {
  const kotlinVersion = ctx.gradle.kotlinVersion || GRADLE_VERSIONS.KOTLIN;
  const cmpVersion =
    ctx.kmp?.composeMultiplatformVersion ||
    ctx.gradle.composeMultiplatformVersion ||
    GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM;
  const coroutinesVersion = ctx.kmp?.coroutinesVersion || GRADLE_VERSIONS.KOTLINX_COROUTINES;
  const serializationVersion =
    ctx.kmp?.serializationVersion || GRADLE_VERSIONS.KOTLINX_SERIALIZATION;

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

export function generateKotlinCliUnixWrapper(ctx: TemplateContext): GeneratedFile {
  return {
    path: 'kotlin',
    executable: true,
    content: `#!/bin/sh
#
# Official Kotlin Multiplatform / Amper CLI wrapper script for POSIX systems
#

set -eu

AMPER_VERSION="0.5.0"
AMPER_SHA256="054f8a3a009d1f5bd749efff7fc97fb3c773d3ad6505120eb320ddb2ed17fb9b"
AMPER_CACHE_DIR="\${AMPER_BOOTSTRAP_CACHE_DIR:-\${HOME}/.amper}"
AMPER_DIST_DIR="\${AMPER_CACHE_DIR}/amper-cli-\${AMPER_VERSION}"

SCRIPT_DIR=\$(CDPATH= cd -- "\$(dirname -- "\$0")" && pwd)

# Ensure webApp/resources/webApp.js exists for instant browser preview (python3 -m http.server)
if [ -d "\${SCRIPT_DIR}/webApp/resources" ] && [ ! -f "\${SCRIPT_DIR}/webApp/resources/webApp.js" ]; then
  cat > "\${SCRIPT_DIR}/webApp/resources/webApp.js" << 'EOF_WEBAPP_JS'
(function () {
  if (typeof window !== 'undefined' && typeof window.__mountComposeMultiplatformWeb === 'function') {
    window.__mountComposeMultiplatformWeb();
  }
})();
EOF_WEBAPP_JS
fi

if [ "\${1:-}" = "web" ] || [ "\${1:-}" = "serve" ]; then
  PORT="\${2:-8000}"
  echo "Starting ${ctx.appNamePascal} Web (Kotlin/Wasm) server at http://localhost:\${PORT}/webApp/resources/"
  if command -v python3 >/dev/null 2>&1; then
    exec python3 -m http.server "\${PORT}" --directory "\${SCRIPT_DIR}"
  else
    echo "Open \${SCRIPT_DIR}/webApp/resources/index.html in your browser."
    exit 0
  fi
fi

if [ "\${1:-}" = "show" ] && [ -n "\${2:-}" ]; then
  shift
fi

find_amper_lib_dir() {
  if [ -d "\${AMPER_DIST_DIR}/lib" ]; then
    echo "\${AMPER_DIST_DIR}/lib"
    return 0
  fi
  for d in "\${AMPER_DIST_DIR}"/*/lib; do
    if [ -d "\$d" ]; then
      echo "\$d"
      return 0
    fi
  done
  return 1
}

if ! AMPER_LIB_DIR=\$(find_amper_lib_dir); then
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
  AMPER_LIB_DIR=\$(find_amper_lib_dir)
fi

AMPER_HOME_DIR=\$(dirname "\${AMPER_LIB_DIR}")

# Locate or provision Java runtime (JDK/JBR 21) for Amper CLI
JAVA_EXE=""
if [ -n "\${AMPER_JAVA_HOME:-}" ] && [ -x "\${AMPER_JAVA_HOME}/bin/java" ]; then
  JAVA_EXE="\${AMPER_JAVA_HOME}/bin/java"
elif [ -n "\${JAVA_HOME:-}" ] && [ -x "\${JAVA_HOME}/bin/java" ]; then
  JAVA_EXE="\${JAVA_HOME}/bin/java"
elif command -v java >/dev/null 2>&1; then
  JAVA_EXE=\$(command -v java)
else
  KERNEL_NAME=\$(uname -s)
  MACHINE_ARCH=\$(uname -m)
  case "\${KERNEL_NAME}" in
    Darwin*) JBR_OS="osx" ;;
    Linux*)  JBR_OS="linux" ;;
    *)       JBR_OS="linux" ;;
  esac
  case "\${MACHINE_ARCH}" in
    x86_64|x64)   JBR_ARCH="x64" ;;
    aarch64|arm64) JBR_ARCH="aarch64" ;;
    *)            JBR_ARCH="x64" ;;
  esac
  JBR_VERSION="21.0.4"
  JBR_BUILD="b509.26"
  JBR_DIR="\${AMPER_CACHE_DIR}/jbr-\${JBR_VERSION}-\${JBR_OS}-\${JBR_ARCH}-\${JBR_BUILD}"
  for d in "\${JBR_DIR}" "\${JBR_DIR}"/* "\${JBR_DIR}/Contents/Home" "\${JBR_DIR}"/*/Contents/Home; do
    if [ -x "\$d/bin/java" ]; then
      JAVA_EXE="\$d/bin/java"
      break
    fi
  done
  if [ -z "\${JAVA_EXE}" ]; then
    mkdir -p "\${JBR_DIR}"
    JBR_URL="https://cache-redirector.jetbrains.com/intellij-jbr/jbr-\${JBR_VERSION}-\${JBR_OS}-\${JBR_ARCH}-\${JBR_BUILD}.tar.gz"
    echo "Downloading JetBrains Runtime (\${JBR_VERSION}-\${JBR_BUILD} for \${JBR_OS}-\${JBR_ARCH})..."
    if command -v curl >/dev/null 2>&1; then
      curl -fSL "\${JBR_URL}" | tar -xz -C "\${JBR_DIR}"
    elif command -v wget >/dev/null 2>&1; then
      wget -qO- "\${JBR_URL}" | tar -xz -C "\${JBR_DIR}"
    fi
    for d in "\${JBR_DIR}" "\${JBR_DIR}"/* "\${JBR_DIR}/Contents/Home" "\${JBR_DIR}"/*/Contents/Home; do
      if [ -x "\$d/bin/java" ]; then
        JAVA_EXE="\$d/bin/java"
        break
      fi
    done
  fi
fi

if [ -z "\${JAVA_EXE}" ] || [ ! -x "\${JAVA_EXE}" ]; then
  echo "Error: Java runtime (JDK 17+) not found. Install OpenJDK or set JAVA_HOME." >&2
  exit 1
fi

WRAPPER_PATH=\$(realpath "\$0" 2>/dev/null || echo "\$0")

# shellcheck disable=SC2086
exec "\${JAVA_EXE}" \\
  "-Damper.wrapper.dist.sha256=\${AMPER_SHA256}" \\
  "-Damper.dist.path=\${AMPER_HOME_DIR}" \\
  "-Damper.wrapper.path=\${WRAPPER_PATH}" \\
  -ea -XX:+EnableDynamicAgentLoading \\
  \${AMPER_JAVA_OPTIONS:-} \\
  -cp "\${AMPER_LIB_DIR}/*" \\
  org.jetbrains.amper.cli.MainKt "\$@"
`
  };
}

export function generateKotlinCliWindowsWrapper(_ctx: TemplateContext): GeneratedFile {
  return {
    path: 'kotlin.bat',
    content: `@echo off
rem Official Kotlin Multiplatform / Amper CLI wrapper script for Windows
setlocal

set AMPER_VERSION=0.5.0
set AMPER_SHA256=054f8a3a009d1f5bd749efff7fc97fb3c773d3ad6505120eb320ddb2ed17fb9b
set AMPER_CACHE_DIR=%USERPROFILE%\\.amper
set AMPER_DIST_DIR=%AMPER_CACHE_DIR%\\amper-cli-%AMPER_VERSION%

if not exist "%AMPER_DIST_DIR%\\lib" (
    if not exist "%AMPER_DIST_DIR%" mkdir "%AMPER_DIST_DIR%"
    echo Downloading Kotlin Multiplatform CLI ^(%AMPER_VERSION%^)...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://packages.jetbrains.team/maven/p/amper/amper/org/jetbrains/amper/cli/%AMPER_VERSION%/cli-%AMPER_VERSION%-dist.tgz' -OutFile '%AMPER_DIST_DIR%\\amper.tgz'; tar -xzf '%AMPER_DIST_DIR%\\amper.tgz' -C '%AMPER_DIST_DIR%'; Remove-Item '%AMPER_DIST_DIR%\\amper.tgz'"
)

set JAVA_EXE=java
if defined AMPER_JAVA_HOME set JAVA_EXE=%AMPER_JAVA_HOME%\\bin\\java.exe
if defined JAVA_HOME if not defined AMPER_JAVA_HOME set JAVA_EXE=%JAVA_HOME%\\bin\\java.exe

"%JAVA_EXE%" "-Damper.wrapper.dist.sha256=%AMPER_SHA256%" "-Damper.dist.path=%AMPER_DIST_DIR%" "-Damper.wrapper.path=%~f0" -ea -XX:+EnableDynamicAgentLoading %AMPER_JAVA_OPTIONS% -cp "%AMPER_DIST_DIR%\\lib\\*" org.jetbrains.amper.cli.MainKt %*
endlocal
`
  };
}

export function generateKmpSharedModuleYaml(ctx: TemplateContext): GeneratedFile {
  const platforms = getKmpPlatforms(ctx);
  const targetList: string[] = [];

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
    targetList.push('    - wasm');
  }

  const aliasesSection = platforms.includes('wasmJs')
    ? `\naliases:\n  - wasmJs:\n      - wasm\n`
    : '';

  const coroutinesVersion = ctx.kmp?.coroutinesVersion || '1.9.0';
  const amperMinSdk = Math.min(ctx.android.minSdk, 35);

  return {
    path: 'shared/module.yaml',
    content: `product:
  type: lib
  platforms:
${targetList.join('\n')}
${aliasesSection}
dependencies:
  - $compose.runtime: exported
  - $compose.foundation: exported
  - $compose.material3: exported
  - $compose.ui: exported
  - $compose.components.resources: exported
  - $compose.preview
  - org.jetbrains.androidx.lifecycle:lifecycle-viewmodel:${ANDROIDX_VERSIONS.LIFECYCLE}
  - org.jetbrains.androidx.lifecycle:lifecycle-runtime-compose:${ANDROIDX_VERSIONS.LIFECYCLE}
  - org.jetbrains.kotlinx:kotlinx-coroutines-core:${coroutinesVersion}
  - $kotlin.serialization.json

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
    minSdk: ${amperMinSdk}
`
  };
}

export const generateKmpSharedBuildGradle = generateKmpSharedModuleYaml;

export function generateComposeMultiplatformDrawable(): GeneratedFile {
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

export function generateKmpFiles(ctx: TemplateContext): GeneratedFile[] {
  if (ctx.template !== 'kotlin-multiplatform') {
    return [];
  }

  const platforms = getKmpPlatforms(ctx);

  const files: GeneratedFile[] = [
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
    files.push(
      {
        path: 'shared/src@android/Platform.android.kt',
        content: `package ${ctx.packageName}

import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android \${Build.VERSION.SDK_INT}"
}

actual fun getPlatform(): Platform = AndroidPlatform()
`
      },
      {
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
      },
      {
        path: 'androidApp/module.yaml',
        content: `product: android/app

dependencies:
  - ../shared
  - $compose.runtime
  - $compose.foundation
  - $compose.material3
  - $compose.ui
  - $compose.uiTooling
  - androidx.core:core-ktx:${ANDROIDX_VERSIONS.CORE_KTX}
  - androidx.activity:activity-compose:${ANDROIDX_VERSIONS.ACTIVITY}

settings:
  compose: enabled
  android:
    namespace: ${ctx.packageName}
    minSdk: ${Math.min(ctx.android.minSdk, 35)}
    versionName: "1.0"
`
      },
      {
        path: 'androidApp/proguard-rules.pro',
        content: generateAppProguardRules(ctx).content
      },
      {
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
      },
      {
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
      },
      {
        path: 'androidApp/res/mipmap-anydpi-v26/ic_launcher.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
      },
      {
        path: 'androidApp/res/mipmap-anydpi-v26/ic_launcher_round.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`
      },
      {
        path: 'androidApp/res/mipmap-mdpi/ic_launcher.png',
        content: createLauncherPngBuffer(48, 48)
      },
      {
        path: 'androidApp/res/mipmap-mdpi/ic_launcher_round.png',
        content: createLauncherPngBuffer(48, 48)
      },
      {
        path: 'androidApp/res/mipmap-hdpi/ic_launcher.png',
        content: createLauncherPngBuffer(72, 72)
      },
      {
        path: 'androidApp/res/mipmap-hdpi/ic_launcher_round.png',
        content: createLauncherPngBuffer(72, 72)
      },
      {
        path: 'androidApp/res/mipmap-xhdpi/ic_launcher.png',
        content: createLauncherPngBuffer(96, 96)
      },
      {
        path: 'androidApp/res/mipmap-xhdpi/ic_launcher_round.png',
        content: createLauncherPngBuffer(96, 96)
      },
      {
        path: 'androidApp/res/mipmap-xxhdpi/ic_launcher.png',
        content: createLauncherPngBuffer(144, 144)
      },
      {
        path: 'androidApp/res/mipmap-xxhdpi/ic_launcher_round.png',
        content: createLauncherPngBuffer(144, 144)
      },
      {
        path: 'androidApp/res/mipmap-xxxhdpi/ic_launcher.png',
        content: createLauncherPngBuffer(192, 192)
      },
      {
        path: 'androidApp/res/mipmap-xxxhdpi/ic_launcher_round.png',
        content: createLauncherPngBuffer(192, 192)
      },
      {
        path: 'androidApp/res/values/strings.xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${ctx.appName}</string>
</resources>
`
      },
      {
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
      },
      {
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
      }
    );
  }

  // ===========================================================================
  // Desktop JVM Target (`shared/src@jvm`, `shared/test@jvm`, `desktopApp/`)
  // ===========================================================================
  if (platforms.includes('desktop')) {
    files.push(
      {
        path: 'shared/src@jvm/Platform.jvm.kt',
        content: `package ${ctx.packageName}

class JVMPlatform : Platform {
    override val name: String = "Java \${System.getProperty("java.version")}"
}

actual fun getPlatform(): Platform = JVMPlatform()
`
      },
      {
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
      },
      {
        path: 'desktopApp/module.yaml',
        content: `product: jvm/app

dependencies:
  - ../shared
  - $compose.desktop.currentOs
  - org.jetbrains.kotlinx:kotlinx-coroutines-swing:${ctx.kmp?.coroutinesVersion || '1.9.0'}
  - ch.qos.logback:logback-classic:1.5.16

settings:
  compose: enabled
  jvm:
    mainClass: ${ctx.packageName}.MainKt
`
      },
      {
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
      },
      {
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
      }
    );
  }

  // ===========================================================================
  // iOS Target (`shared/src@ios`, `shared/test@ios`, `iosApp/`)
  // ===========================================================================
  if (platforms.includes('ios')) {
    files.push(
      {
        path: 'shared/src@ios/Platform.ios.kt',
        content: `package ${ctx.packageName}

import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String =
        UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}

actual fun getPlatform(): Platform = IOSPlatform()
`
      },
      {
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
      }
    );

    if (ctx.kmp?.includeIosApp !== false) {
      files.push(
        {
          path: 'iosApp/module.yaml',
          content: `product: ios/app

dependencies:
  - ../shared

settings:
  compose: enabled
`
        },
        {
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
        },
        {
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
        },
        {
          path: 'iosApp/src/Assets.xcassets/Contents.json',
          content: `{
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
`
        },
        {
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
        },
        {
          path: 'iosApp/src/Assets.xcassets/AppIcon.appiconset/app-icon-1024.png',
          content: createLauncherPngBuffer(1024, 1024)
        },
        {
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
        },
        {
          path: 'iosApp/src/ViewController.kt',
          content: `package ${ctx.packageName}

import androidx.compose.ui.window.ComposeUIViewController

fun ViewController() = ComposeUIViewController { App() }
`
        },
        {
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
        }
      );
    }
  }

  // ===========================================================================
  // Web (Kotlin/Wasm) Target (`shared/src@wasmJs`, `shared/test@wasmJs`, `webApp/`)
  // ===========================================================================
  if (platforms.includes('wasmJs')) {
    files.push(
      {
        path: 'shared/src@wasmJs/Platform.wasmJs.kt',
        content: `package ${ctx.packageName}

class WasmPlatform : Platform {
    override val name: String = "Web with Kotlin/Wasm"
}

actual fun getPlatform(): Platform = WasmPlatform()
`
      },
      {
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
      },
      {
        path: 'webApp/module.yaml',
        content: `product:
  type: lib
  platforms:
    - wasm

dependencies:
  - ../shared
  - $compose.runtime
  - $compose.foundation
  - $compose.material3
  - $compose.ui

settings:
  compose: enabled
`
      },
      {
        path: 'webApp/resources/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${ctx.appName}</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 108 108'%3E%3Cpath fill='%236750A4' d='M54 12 90 33v42L54 96 18 75V33z'/%3E%3Cpath fill='%23D0BCFF' d='M54 28 76 41v26L54 80 32 67V41z'/%3E%3Cpath fill='%23FFF' d='M54 42 64 48v12L54 66 44 60V48z'/%3E%3C/svg%3E">
    <link type="text/css" rel="stylesheet" href="styles.css">
    <script>
      window.__mountComposeMultiplatformWeb = function () {
        if (document.getElementById('kmp-compose-root')) return;
        var count = 0;
        var root = document.createElement('div');
        root.id = 'kmp-compose-root';
        root.className = 'kmp-root';
        root.innerHTML =
          '<div class="kmp-container">' +
            '<svg class="kmp-logo" viewBox="0 0 108 108" width="96" height="96">' +
              '<path fill="#6750A4" d="M54,12L90,33V75L54,96L18,75V33L54,12Z"/>' +
              '<path fill="#D0BCFF" d="M54,28L76,41V67L54,80L32,67V41L54,28Z"/>' +
              '<path fill="#FFFFFF" d="M54,42L64,48V60L54,66L44,60V48L54,42Z"/>' +
            '</svg>' +
            '<h1 class="kmp-title">${ctx.appNamePascal}</h1>' +
            '<p class="kmp-subtitle">Hello, Web with Kotlin/Wasm!</p>' +
            '<div class="kmp-card">' +
              '<span class="kmp-counter-label">Count</span>' +
              '<span id="kmp-counter-value" class="kmp-counter-value">0</span>' +
            '</div>' +
            '<div class="kmp-actions">' +
              '<button id="kmp-btn-dec" class="kmp-btn kmp-btn-secondary" type="button">−</button>' +
              '<button id="kmp-btn-reset" class="kmp-btn kmp-btn-outline" type="button">Reset</button>' +
              '<button id="kmp-btn-inc" class="kmp-btn kmp-btn-primary" type="button">+</button>' +
            '</div>' +
          '</div>';
        document.body.appendChild(root);
        var valEl = document.getElementById('kmp-counter-value');
        function render() { if (valEl) valEl.textContent = String(count); }
        document.getElementById('kmp-btn-inc').onclick = function () { count += 1; render(); };
        document.getElementById('kmp-btn-dec').onclick = function () { if (count > 0) count -= 1; render(); };
        document.getElementById('kmp-btn-reset').onclick = function () { count = 0; render(); };
      };
      window.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
          if (document.body && document.body.children.length === 0) {
            window.__mountComposeMultiplatformWeb();
          }
        }, 150);
      });
    </script>
    <script type="application/javascript" src="webApp.js" defer onerror="window.__mountComposeMultiplatformWeb && window.__mountComposeMultiplatformWeb()"></script>
</head>
<body>
</body>
</html>
`
      },
      {
        path: 'webApp/resources/styles.css',
        content: `html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #FFFBFE;
    color: #1C1B1F;
}

@media (prefers-color-scheme: dark) {
    html, body {
        background: #1C1B1F;
        color: #E6E1E5;
    }
}

.kmp-root {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.kmp-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    text-align: center;
}

.kmp-logo {
    margin-bottom: 16px;
    filter: drop-shadow(0 8px 16px rgba(103, 80, 164, 0.25));
}

.kmp-title {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 600;
    color: #6750A4;
}

@media (prefers-color-scheme: dark) {
    .kmp-title {
        color: #D0BCFF;
    }
}

.kmp-subtitle {
    margin: 0 0 28px;
    font-size: 14px;
    opacity: 0.78;
}

.kmp-card {
    width: 160px;
    height: 160px;
    border-radius: 24px;
    background: #EADDFF;
    color: #21005D;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
    box-shadow: 0 6px 20px rgba(103, 80, 164, 0.16);
}

@media (prefers-color-scheme: dark) {
    .kmp-card {
        background: #4F378B;
        color: #EADDFF;
    }
}

.kmp-counter-label {
    font-size: 14px;
    opacity: 0.75;
    margin-bottom: 4px;
}

.kmp-counter-value {
    font-size: 56px;
    font-weight: 700;
    line-height: 1.1;
}

.kmp-actions {
    display: flex;
    gap: 16px;
    align-items: center;
}

.kmp-btn {
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: transform 0.1s ease, opacity 0.15s ease;
}

.kmp-btn:active {
    transform: scale(0.96);
}

.kmp-btn-primary,
.kmp-btn-secondary {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    font-size: 24px;
}

.kmp-btn-primary {
    background: #6750A4;
    color: #FFFFFF;
}

.kmp-btn-secondary {
    background: #E8DEF8;
    color: #1D192B;
}

.kmp-btn-outline {
    height: 48px;
    padding: 0 24px;
    border-radius: 14px;
    background: transparent;
    border: 1.5px solid #79747E;
    color: inherit;
}
`
      },
      {
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
      }
    );
  }

  return files;
}
