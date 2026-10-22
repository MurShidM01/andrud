/**
 * Project root file generators (.gitignore, README.md)
 */

import type { TemplateContext, GeneratedFile } from '../core/types.js';
import { getKmpPlatforms } from './kmp.js';

export function generateGitIgnore(_ctx: TemplateContext): GeneratedFile {
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

# Kotlin Multiplatform / iOS / Web
kotlin-js-store/
iosApp/Pods/
iosApp/*.xcworkspace
iosApp/iosApp.xcodeproj/xcuserdata/
`
  };
}

export function generateReadme(ctx: TemplateContext): GeneratedFile {
  if (ctx.template === 'kotlin-multiplatform') {
    const platforms = getKmpPlatforms(ctx);
    const platformList = platforms
      .map((p) => {
        if (p === 'android') return '- **Android** (`:app`, `:shared/androidMain`)';
        if (p === 'ios') return '- **iOS** (`iosApp`, `:shared/iosMain`)';
        if (p === 'desktop') return '- **Desktop JVM** (`:shared/desktopMain`)';
        if (p === 'wasmJs') return '- **Web (Kotlin/Wasm)** (`:shared/wasmJsMain`)';
        return `- **${p}**`;
      })
      .join('\n');

    return {
      path: 'README.md',
      content: `# ${ctx.appName}

A cross-platform **Kotlin Multiplatform (KMP)** and **Compose Multiplatform** project.

## Target Platforms
${platformList}

## Project Structure
- \`lib/\` — **Flutter-style cross-platform public code** (\`lib/main.kt\`, \`lib/App.kt\`, \`lib/Platform.kt\`, \`lib/Greeting.kt\`, \`lib/ui/theme/\`) shared across all target platforms
- \`test/\` — Cross-platform unit tests (\`test/GreetingTest.kt\`)
- \`shared/\` — Kotlin Multiplatform module & native platform bindings (\`androidMain\`, \`iosMain\`, \`desktopMain\`, \`wasmJsMain\`)
- \`app/\` — Android application runner powered by Jetpack Compose & \`:shared\`
${platforms.includes('ios') ? '- `iosApp/` — iOS SwiftUI host application wrapping the shared Compose Multiplatform UI\n' : ''}- \`gradle/libs.versions.toml\` — Gradle version catalog

## Requirements
- Android Studio Ladybug (2024.2.1) or Fleet / IntelliJ IDEA
- JDK 17 or later
- Android SDK API ${ctx.android.targetSdk}
- Gradle ${ctx.gradle.gradleVersion}
${platforms.includes('ios') ? '- Xcode 16+ (on macOS for iOS builds)\n' : ''}
## Build & Run Commands
- **Android Debug APK**: \`./gradlew :app:assembleDebug\`
- **Shared Multiplatform Tests**: \`./gradlew :shared:allTests\`
${platforms.includes('desktop') ? '- **Desktop JVM**: `./gradlew :shared:run`\n' : ''}${platforms.includes('wasmJs') ? '- **Web (Kotlin/Wasm)**: `./gradlew :shared:wasmJsBrowserDevelopmentRun`\n' : ''}
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
