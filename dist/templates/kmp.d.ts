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
import type { TemplateContext, GeneratedFile, KmpPlatform } from '../core/types.js';
export declare function getKmpPlatforms(ctx: TemplateContext): KmpPlatform[];
export declare function getKmpDirectories(ctx: TemplateContext): string[];
export declare function generateKmpProjectYaml(ctx: TemplateContext): GeneratedFile;
export declare function generateKmpVersionCatalog(ctx: TemplateContext): GeneratedFile;
export declare function generateKotlinCliUnixWrapper(ctx: TemplateContext): GeneratedFile;
export declare function generateKotlinCliWindowsWrapper(_ctx: TemplateContext): GeneratedFile;
export declare function generateKmpSharedModuleYaml(ctx: TemplateContext): GeneratedFile;
export declare const generateKmpSharedBuildGradle: typeof generateKmpSharedModuleYaml;
export declare function generateComposeMultiplatformDrawable(): GeneratedFile;
export declare function generateKmpFiles(ctx: TemplateContext): GeneratedFile[];
//# sourceMappingURL=kmp.d.ts.map