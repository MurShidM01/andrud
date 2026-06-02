# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Template customization options.
- Plugin system for custom generators.
- Configuration file support (`andrud.config.js`).
- Additional hardware/runner validation for Linux arm64, Windows amd64, and macOS.

---

## [1.0.5] - 2026-06-02

### Fixed
- Fixed Linux project directory resolution for absolute parent paths such as `/home/Android-Apps`.
- Fixed trailing-slash parent paths such as `/home/Android-Apps/` so generated projects no longer use literal backslash-prefixed folder names like `\myapp`.
- Normalized pasted Windows-style backslashes on POSIX hosts to prevent accidental literal `\` directories.
- Relaxed directory validation to accept safe Windows drive-letter paths such as `D:\Projects\Android`.

### Added
- Added shared path helpers for host-aware base-directory normalization and sanitized app folder naming.
- Added filesystem tests for Linux absolute paths, trailing slash paths, pasted backslash paths, and Windows drive-path validation.
- Added README platform matrix documenting verified Linux amd64 behavior and supported platform targets.

### Verified
- Verified `andrud new` on Linux amd64 with `/home/Android-Apps`, `/home/Android-Apps/`, and pasted backslash inputs.
- Verified generated Linux amd64 `gradlew --version` using a local Gradle distribution mirror in a restricted network environment.

---

## [1.0.4] - 2026-06-02

### Fixed
- Restored complete Gradle Wrapper generation, including `gradlew`, `gradlew.bat`, `gradle-wrapper.properties`, and `gradle-wrapper.jar`.
- Marked generated POSIX `gradlew` scripts executable.
- Added binary file support for generated assets such as `gradle-wrapper.jar`.
- Updated CLI output and generated README instructions to recommend `./gradlew assembleDebug` after wrapper generation was restored.

### Changed
- Updated generated Gradle wrapper distribution to Gradle `8.14.4`.

### Verified
- Verified generated wrapper script syntax and wrapper JAR contents on Linux amd64.
- Verified generated `gradlew --version` on Linux amd64 using a local Gradle distribution mirror.

---

## [1.0.3] - 2026-06-02

### Added
- Added non-interactive defaults through `-y, --yes` for CLI project generation.
- Added `andrud new` options for template, package, directory, SDK levels, optional file generation, and install skipping.
- Added `andrud init` options for template, package, defaults, and force behavior.
- Added initial native C++ scaffolding with `CMakeLists.txt`, `native-lib.cpp`, and `NativeLib.kt`.

### Changed
- Improved generated Android build files for Compose, ViewBinding, DataBinding, Java, Kotlin, and native C++ templates.
- Fully qualified `MainActivity` in generated Android manifests.
- Updated generator metadata and welcome banner version display.

### Fixed
- Fixed `andrud new -p/--package` option handling.
- Fixed non-interactive command failures caused by prompts being invoked in non-TTY environments.
- Fixed test command behavior by building first and running compiled tests from `dist`.
- Changed unknown template configuration lookup to fail fast instead of silently falling back.

---

## [1.0.2] - 2026-06-01

### Fixed
- Improved TypeScript build output consistency for published `dist` artifacts.
- Cleaned up CLI command wiring and generated metadata alignment.
- Improved validation and context handling for generated project templates.

---

## [1.0.1] - 2026-06-01

### Fixed
- Addressed early CLI polish issues after the initial release.
- Improved generated project defaults and documentation consistency.
- Refined template metadata and command output wording.

---

## [1.0.0] - 2026-05-31

### 🎉 Initial Release

#### Added
- **4 Project Templates**:
  - `kotlin-xml` - Kotlin with XML Views
  - `kotlin-compose` - Kotlin with Jetpack Compose
  - `java-xml` - Java with XML Views
  - `native-cpp` - Kotlin with Native C++/NDK support

- **CLI Commands**:
  - `andrud create` - Interactive project creation
  - `andrud new <name>` - Quick project creation
  - `andrud list` - List all templates
  - `andrud info <template>` - View template details

- **Features**:
  - Beautiful interactive prompts with @clack/prompts
  - Colorful terminal output with gradients
  - Production-ready Gradle configurations
  - Android 15/16 (SDK 35/36) support
  - Latest Jetpack libraries integration
  - Material Design 3 support
  - ViewBinding and DataBinding support
  - Jetpack Compose support
  - Native C++/NDK integration
  - Gradle wrapper generation
  - `.gitignore` generation
  - `README.md` generation

#### Technical
- Built with TypeScript 5.4.
- Node.js 18+ required.
- ES Modules (ESM) support.
- Full type safety.
- Comprehensive validation utilities.

---

## Version History

| Version | Status | Date |
|---------|--------|------|
| 1.0.5 | ✅ Current | 2026-06-02 |
| 1.0.4 | ✅ Released | 2026-06-02 |
| 1.0.3 | ✅ Released | 2026-06-02 |
| 1.0.2 | ✅ Released | 2026-06-01 |
| 1.0.1 | ✅ Released | 2026-06-01 |
| 1.0.0 | ✅ Released | 2026-05-31 |
| 0.0.1 | 🔧 Development | 2026-05-28 |
