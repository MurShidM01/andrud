/**
 * Kotlin Multiplatform (KMP) & Compose Multiplatform cross-platform file generators
 * Uses a Flutter-style top-level `lib/` directory for all public cross-platform Kotlin code
 * (`lib/main.kt`, `lib/App.kt`, `lib/Platform.kt`, `lib/Greeting.kt`, `lib/ui/theme/*`)
 * and `test/` for cross-platform tests, wired into `commonMain` and `commonTest`.
 */
import type { TemplateContext, GeneratedFile, KmpPlatform } from '../core/types.js';
export declare function getKmpPlatforms(ctx: TemplateContext): KmpPlatform[];
export declare function getKmpDirectories(ctx: TemplateContext): string[];
export declare function generateKmpVersionCatalog(ctx: TemplateContext): GeneratedFile;
export declare function generateKmpSharedBuildGradle(ctx: TemplateContext): GeneratedFile;
export declare function generateKmpFiles(ctx: TemplateContext): GeneratedFile[];
//# sourceMappingURL=kmp.d.ts.map