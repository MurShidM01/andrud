# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
  - .gitignore generation
  - README.md generation

#### Technical
- Built with TypeScript 5.4
- Node.js 18+ required
- ES Modules (ESM) support
- Full type safety
- Comprehensive validation utilities

---

## [Unreleased]

### Planned Features
- [ ] Template customization options
- [ ] Plugin system for custom generators
- [ ] Progress reporting for large projects
- [ ] Dry-run mode
- [ ] Git initialization option
- [ ] Configuration file support (andrud.config.js)
- [ ] Interactive mode with --interactive flag

---

## Version History

| Version | Status | Date |
|---------|--------|------|
| 1.0.0 | ✅ Current | 2026-05-31 |
| 0.0.1 | 🔧 Development | 2026-05-28 |

---

**Note**: Initial release marks the first stable version of andrud CLI.
