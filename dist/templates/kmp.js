/**
 * Kotlin Multiplatform (KMP) & Compose Multiplatform cross-platform file generators
 * Uses a Flutter-style top-level `lib/` directory for all public cross-platform Kotlin code
 * (`lib/main.kt`, `lib/App.kt`, `lib/Platform.kt`, `lib/Greeting.kt`, `lib/ui/theme/*`)
 * and `test/` for cross-platform tests, wired into `commonMain` and `commonTest`.
 */
import { GRADLE_VERSIONS, ANDROIDX_VERSIONS, DEFAULT_KMP_PLATFORMS } from '../core/config.js';
export function getKmpPlatforms(ctx) {
    return ctx.kmp?.platforms && ctx.kmp.platforms.length > 0
        ? ctx.kmp.platforms
        : [...DEFAULT_KMP_PLATFORMS];
}
export function getKmpDirectories(ctx) {
    if (ctx.template !== 'kotlin-multiplatform') {
        return [];
    }
    const packagePath = ctx.packagePath;
    const platforms = getKmpPlatforms(ctx);
    const dirs = [
        // Flutter-style top-level lib/ and test/ directories for all public cross-platform code
        'lib',
        'lib/ui/theme',
        'test',
        `shared/src/androidMain/kotlin/${packagePath}/shared`
    ];
    if (platforms.includes('ios')) {
        dirs.push(`shared/src/iosMain/kotlin/${packagePath}/shared`);
        if (ctx.kmp?.includeIosApp !== false) {
            dirs.push('iosApp/iosApp', 'iosApp/Configuration');
        }
    }
    if (platforms.includes('desktop')) {
        dirs.push(`shared/src/desktopMain/kotlin/${packagePath}/shared`);
    }
    if (platforms.includes('wasmJs')) {
        dirs.push(`shared/src/wasmJsMain/kotlin/${packagePath}/shared`, 'shared/src/wasmJsMain/resources');
    }
    return dirs;
}
export function generateKmpVersionCatalog(ctx) {
    const kotlinVersion = ctx.gradle.kotlinVersion || GRADLE_VERSIONS.KOTLIN;
    const cmpVersion = ctx.kmp?.composeMultiplatformVersion ||
        ctx.gradle.composeMultiplatformVersion ||
        GRADLE_VERSIONS.COMPOSE_MULTIPLATFORM;
    const coroutinesVersion = ctx.kmp?.coroutinesVersion || GRADLE_VERSIONS.KOTLINX_COROUTINES;
    const serializationVersion = ctx.kmp?.serializationVersion || GRADLE_VERSIONS.KOTLINX_SERIALIZATION;
    return {
        path: 'gradle/libs.versions.toml',
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

[libraries]
kotlin-test = { module = "org.jetbrains.kotlin:kotlin-test", version.ref = "kotlin" }
kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
kotlinx-coroutines-swing = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-swing", version.ref = "kotlinx-coroutines" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinx-serialization" }
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "androidx-core-ktx" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "androidx-appcompat" }
androidx-activity-compose = { module = "androidx.activity:activity-compose", version.ref = "androidx-activityCompose" }

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
export function generateKmpSharedBuildGradle(ctx) {
    const platforms = getKmpPlatforms(ctx);
    const hasIos = platforms.includes('ios');
    const hasDesktop = platforms.includes('desktop');
    const hasWasm = platforms.includes('wasmJs');
    const coroutinesVersion = ctx.kmp?.coroutinesVersion || GRADLE_VERSIONS.KOTLINX_COROUTINES;
    const serializationVersion = ctx.kmp?.serializationVersion || GRADLE_VERSIONS.KOTLINX_SERIALIZATION;
    const imports = ['import org.jetbrains.kotlin.gradle.dsl.JvmTarget'];
    if (hasDesktop) {
        imports.push('import org.jetbrains.compose.desktop.application.dsl.TargetFormat');
    }
    if (hasWasm) {
        imports.push('import org.jetbrains.kotlin.gradle.ExperimentalWasmDsl');
    }
    let targetsBlock = `    androidTarget {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_17)
        }
    }
`;
    if (hasIos) {
        targetsBlock += `
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "shared"
            isStatic = true
        }
    }
`;
    }
    if (hasDesktop) {
        targetsBlock += `
    jvm("desktop") {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_17)
        }
    }
`;
    }
    if (hasWasm) {
        targetsBlock += `
    @OptIn(ExperimentalWasmDsl::class)
    wasmJs {
        moduleName = "shared"
        browser {
            commonWebpackConfig {
                outputFileName = "shared.js"
            }
        }
        binaries.executable()
    }
`;
    }
    let sourceSetsBlock = `    sourceSets {
        commonMain {
            // Flutter-style top-level lib/ directory holds all cross-platform public code
            kotlin.srcDir("../lib")
            dependencies {
                implementation(compose.runtime)
                implementation(compose.foundation)
                implementation(compose.material3)
                implementation(compose.ui)
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:${coroutinesVersion}")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:${serializationVersion}")
            }
        }
        commonTest {
            kotlin.srcDir("../test")
            dependencies {
                implementation(kotlin("test"))
            }
        }
        androidMain.dependencies {
            implementation("androidx.core:core-ktx:${ANDROIDX_VERSIONS.CORE_KTX}")
        }
`;
    if (hasDesktop) {
        sourceSetsBlock += `        val desktopMain by getting {
            dependencies {
                implementation(compose.desktop.currentOs)
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-swing:${coroutinesVersion}")
            }
        }
`;
    }
    sourceSetsBlock += `    }`;
    const desktopAppBlock = hasDesktop
        ? `
compose.desktop {
    application {
        mainClass = "${ctx.packageName}.shared.MainKt"

        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
            packageName = "${ctx.packageName}"
            packageVersion = "1.0.0"
        }
    }
}
`
        : '';
    return {
        path: 'shared/build.gradle.kts',
        content: `${imports.join('\n')}

plugins {
    id("org.jetbrains.kotlin.multiplatform")
    id("com.android.library")
    id("org.jetbrains.compose")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

kotlin {
${targetsBlock}
${sourceSetsBlock}
}

android {
    namespace = "${ctx.packageName}.shared"
    compileSdk = ${ctx.android.compileSdk}

    defaultConfig {
        minSdk = ${ctx.android.minSdk}
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
${desktopAppBlock}`
    };
}
export function generateKmpFiles(ctx) {
    if (ctx.template !== 'kotlin-multiplatform') {
        return [];
    }
    const packagePath = ctx.packagePath;
    const sharedPackage = `${ctx.packageName}.shared`;
    const themePackage = `${sharedPackage}.ui.theme`;
    const platforms = getKmpPlatforms(ctx);
    const files = [
        generateKmpVersionCatalog(ctx),
        generateKmpSharedBuildGradle(ctx),
        // =========================================================================
        // Flutter-style top-level `lib/` directory for all cross-platform public code
        // =========================================================================
        {
            path: 'lib/main.kt',
            content: `package ${sharedPackage}

import androidx.compose.runtime.Composable
import ${themePackage}.${ctx.appNamePascal}SharedTheme

/**
 * Primary cross-platform entry point (similar to Flutter's lib/main.dart).
 * All platforms (Android, iOS, Desktop, and Web) launch this [App] composable.
 */
@Composable
fun App() {
    ${ctx.appNamePascal}SharedTheme {
        SharedApp()
    }
}
`
        },
        {
            path: 'lib/App.kt',
            content: `package ${sharedPackage}

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

@Composable
fun SharedApp() {
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
`
        },
        {
            path: 'lib/Platform.kt',
            content: `package ${sharedPackage}

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform
`
        },
        {
            path: 'lib/Greeting.kt',
            content: `package ${sharedPackage}

class Greeting {
    private val platform: Platform = getPlatform()

    fun greet(): String {
        return "Running on \${platform.name}"
    }
}
`
        },
        {
            path: 'lib/ui/theme/Color.kt',
            content: `package ${themePackage}

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
        },
        {
            path: 'lib/ui/theme/Type.kt',
            content: `package ${themePackage}

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val SharedTypography = Typography(
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
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.15.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.25.sp
    )
)
`
        },
        {
            path: 'lib/ui/theme/Theme.kt',
            content: `package ${themePackage}

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

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
fun ${ctx.appNamePascal}SharedTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = SharedTypography,
        content = content
    )
}
`
        },
        {
            path: 'test/GreetingTest.kt',
            content: `package ${sharedPackage}

import kotlin.test.Test
import kotlin.test.assertTrue

class GreetingTest {
    @Test
    fun testGreetingIsNotEmpty() {
        val message = Greeting().greet()
        assertTrue(message.isNotEmpty(), "Check Greeting is not empty")
        assertTrue(message.contains("Running on"), "Check Greeting includes platform status")
    }
}
`
        },
        // =========================================================================
        // Platform-specific bindings (Android, iOS, Desktop JVM, Web/Wasm)
        // =========================================================================
        {
            path: `shared/src/androidMain/kotlin/${packagePath}/shared/Platform.android.kt`,
            content: `package ${sharedPackage}

import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android \${Build.VERSION.SDK_INT} (\${Build.MODEL})"
}

actual fun getPlatform(): Platform = AndroidPlatform()
`
        }
    ];
    if (platforms.includes('ios')) {
        files.push({
            path: `shared/src/iosMain/kotlin/${packagePath}/shared/Platform.ios.kt`,
            content: `package ${sharedPackage}

import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String =
        UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
}

actual fun getPlatform(): Platform = IOSPlatform()
`
        }, {
            path: `shared/src/iosMain/kotlin/${packagePath}/shared/MainViewController.kt`,
            content: `package ${sharedPackage}

import androidx.compose.ui.window.ComposeUIViewController

fun MainViewController() = ComposeUIViewController { App() }
`
        });
        if (ctx.kmp?.includeIosApp !== false) {
            files.push({
                path: 'iosApp/Configuration/Config.xcconfig',
                content: `TEAM_ID=
BUNDLE_ID=${ctx.packageName}
APP_NAME=${ctx.appName}
`
            }, {
                path: 'iosApp/iosApp/Info.plist',
                content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
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
                path: 'iosApp/iosApp/iOSApp.swift',
                content: `import SwiftUI

@main
struct iOSApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
`
            }, {
                path: 'iosApp/iosApp/ContentView.swift',
                content: `import UIKit
import SwiftUI
import shared

struct ComposeView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        MainViewControllerKt.MainViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

struct ContentView: View {
    var body: some View {
        ComposeView()
            .ignoresSafeArea(.all)
    }
}
`
            });
        }
    }
    if (platforms.includes('desktop')) {
        files.push({
            path: `shared/src/desktopMain/kotlin/${packagePath}/shared/Platform.jvm.kt`,
            content: `package ${sharedPackage}

class JVMPlatform : Platform {
    override val name: String =
        "\${System.getProperty("os.name")} (Java \${System.getProperty("java.version")})"
}

actual fun getPlatform(): Platform = JVMPlatform()
`
        }, {
            path: `shared/src/desktopMain/kotlin/${packagePath}/shared/main.kt`,
            content: `package ${sharedPackage}

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
    if (platforms.includes('wasmJs')) {
        files.push({
            path: `shared/src/wasmJsMain/kotlin/${packagePath}/shared/Platform.wasmJs.kt`,
            content: `package ${sharedPackage}

class WasmPlatform : Platform {
    override val name: String = "Web (Kotlin/Wasm)"
}

actual fun getPlatform(): Platform = WasmPlatform()
`
        }, {
            path: `shared/src/wasmJsMain/kotlin/${packagePath}/shared/main.kt`,
            content: `package ${sharedPackage}

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
        }, {
            path: 'shared/src/wasmJsMain/resources/index.html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${ctx.appName}</title>
    <style>
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
    </style>
    <script type="application/javascript" src="shared.js"></script>
</head>
<body>
</body>
</html>
`
        });
    }
    return files;
}
//# sourceMappingURL=kmp.js.map