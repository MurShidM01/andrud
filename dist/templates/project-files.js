/**
 * Project root file generators (.gitignore, README.md)
 */
import { getKmpPlatforms } from './kmp.js';
export function generateGitIgnore(_ctx) {
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
.kotlin/
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

# Kotlin Multiplatform / Amper / iOS / Web
.amper/
kotlin-js-store/
iosApp/Pods/
iosApp/*.xcworkspace
iosApp/module.xcodeproj/xcuserdata/
iosApp/iosApp.xcodeproj/xcuserdata/
`
    };
}
export function generateReadme(ctx) {
    if (ctx.template === 'kotlin-multiplatform') {
        const platforms = getKmpPlatforms(ctx);
        const platformList = platforms
            .map((p) => {
            if (p === 'android')
                return '- **Android** (`androidApp/`, `shared/src@android/`)';
            if (p === 'ios')
                return '- **iOS** (`iosApp/`, `shared/src@ios/`)';
            if (p === 'desktop')
                return '- **Desktop (JVM)** (`desktopApp/`, `shared/src@jvm/`)';
            if (p === 'wasmJs')
                return '- **Web (Kotlin/Wasm)** (`webApp/`, `shared/src@wasmJs/`)';
            return `- **${p}**`;
        })
            .join('\n');
        return {
            path: 'README.md',
            content: `# ${ctx.appName}

A cross-platform **Kotlin Multiplatform (KMP)** and **Compose Multiplatform** project structured like the official Kotlin CLI.

## Target Platforms
${platformList}

## Project Structure
- \`project.yaml\` — Root multiplatform module configuration
- \`libs.versions.toml\` — Dependency and plugin version catalog
- \`kotlin\` / \`kotlin.bat\` — Official Kotlin Multiplatform CLI wrapper scripts
- \`shared/\` — Shared Compose Multiplatform library module:
  - \`shared/module.yaml\` — Shared module definition & multiplatform targets
  - \`shared/src/\` — Common Kotlin & Compose Multiplatform code (\`App.kt\`, \`Greeting.kt\`, \`Platform.kt\`)
  - \`shared/src@android/\`, \`shared/src@ios/\`, \`shared/src@jvm/\`, \`shared/src@wasmJs/\` — Platform-specific \`actual\` implementations
  - \`shared/test/\` & \`shared/test@*/\` — Common and platform-specific tests
  - \`shared/composeResources/\` — Shared Compose Multiplatform resources
${platforms.includes('android') ? '- `androidApp/` — Android application module (`module.yaml`, `src/MainActivity.kt`, `src/AndroidManifest.xml`, `res/`)\n' : ''}${platforms.includes('desktop') ? '- `desktopApp/` — Desktop JVM application module (`module.yaml`, `src/main.kt`, `resources/logback.xml`)\n' : ''}${platforms.includes('ios') ? '- `iosApp/` — iOS application module (`module.yaml`, `module.xcodeproj/`, `src/ViewController.kt`, `src/iosApp.swift`)\n' : ''}${platforms.includes('wasmJs') ? '- `webApp/` — Web (Kotlin/Wasm) application module (`module.yaml`, `src/main.kt`, `resources/index.html`, `resources/styles.css`)\n' : ''}
## Build & Run Commands
- **Build All Modules**: \`./kotlin build\` (or \`kotlin.bat build\` on Windows)
- **Run Tests**: \`./kotlin test\`
${platforms.includes('android') ? '- **Run Android App**: `./kotlin run -m androidApp`\n' : ''}${platforms.includes('desktop') ? '- **Run Desktop App**: `./kotlin run -m desktopApp`\n' : ''}${platforms.includes('ios') ? '- **Run iOS App**: `./kotlin run -m iosApp` (macOS with Xcode 16+)\n' : ''}${platforms.includes('wasmJs') ? '- **Run Web App**: `./kotlin run -m webApp`\n' : ''}
## License
MIT License
`
        };
    }
    const lang = ctx.language === 'kotlin' ? 'Kotlin' : 'Java';
    const ui = ctx.uiFramework === 'compose' ? 'Jetpack Compose' : 'XML Layouts';
    return {
        path: 'README.md',
        content: `# ${ctx.appName}

An Android application built with ${lang} using ${ui}.

## Requirements
- Android Studio Ladybug (2024.2.1) or later
- JDK 17 or later
- Android SDK API ${ctx.android.targetSdk}
- Gradle ${ctx.gradle.gradleVersion}

## Getting Started
1. Open the project in Android Studio
2. Sync Gradle files
3. Build and run with Android Studio or \`./gradlew assembleDebug\`

## License
MIT License
`
    };
}
//# sourceMappingURL=project-files.js.map