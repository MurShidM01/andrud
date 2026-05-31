# andrud

<p align="center">
  <a href="https://www.npmjs.com/package/andrud"><img src="https://img.shields.io/npm/v/andrud?style=for-the-badge&color=%2300C9FF&labelColor=%23222" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/andrud"><img src="https://img.shields.io/npm/dm/andrud?style=for-the-badge&color=%2392FE9D&labelColor=%23222" alt="npm downloads"></a>
  <img src="https://img.shields.io/github/license/MurShidM01/andrud?style=for-the-badge&color=%23ff6b6b&labelColor=%23222" alt="license">
  <a href="https://github.com/MurShidM01/andrud/stargazers"><img src="https://img.shields.io/github/stars/MurShidM01/andrud?style=for-the-badge&color=%23ffd93d&labelColor=%23222" alt="stars"></a>
  <a href="https://github.com/MurShidM01/andrud/network/members"><img src="https://img.shields.io/github/forks/MurShidM01/andrud?style=for-the-badge&color=%236bcb77&labelColor=%23222" alt="forks"></a>
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js&logoColor=white" alt="node"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript"></a>
  <a href="https://developer.android.com/studio"><img src="https://img.shields.io/badge/Android-Studio-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="android"></a>
  <a href="https://kotlinlang.org/"><img src="https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white" alt="kotlin"></a>
</p>

<h1 align="center">? Modern Android Project Scaffolding CLI</h1>

<p align="center">
  <strong>andrud</strong> is a blazing-fast, interactive CLI tool for generating production-ready Android project structures in seconds. Built for developers who value speed, consistency, and modern Android development practices.
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/MurShidM01/andrud/main/sc.png" width="800" alt="andrud demo">
</p>

---

## ? Features

| Feature | Description |
|---------|-------------|
| ?? **Blazing Fast** | Generate complete Android projects in under 5 seconds |
| ?? **Multiple Templates** | Kotlin, Java, Jetpack Compose, Native C++/NDK support |
| ?? **Interactive CLI** | Beautiful prompts powered by @clack/prompts |
| ?? **Production Ready** | Industry-standard Gradle configuration with latest versions |
| ?? **TypeScript** | Fully typed codebase for reliability |
| ?? **Customizable** | Configure SDK versions, features, and more |
| ?? **Modern Android** | Android 15 (SDK 35/36) with Jetpack libraries |
| ?? **Beautiful UI** | Colorful terminal output with gradients |

---

## ?? Templates

| Template | Language | UI Framework | Use Case |
|----------|----------|--------------|----------|
| `kotlin-xml` | Kotlin | XML Views | Traditional Android development |
| `kotlin-compose` | Kotlin | Jetpack Compose | Modern declarative UI |
| `java-xml` | Java | XML Views | Java projects & legacy codebases |
| `native-cpp` | Kotlin + C++ | XML Views | High-performance & game development |

---

## ?? Quick Start

### Installation

```bash
# Install globally via npm
npm install -g andrud

# Verify installation
andrud --version
```

### Create a New Project

```bash
# Interactive mode (recommended)
andrud create

# With all options specified
andrud new MyApp -t kotlin-compose -p com.example.myapp -d ./projects

# Quick create with defaults
andrud new MyApp
```

### Available Commands

| Command | Description |
|---------|-------------|
| `andrud create` | Interactive project creation |
| `andrud new <name>` | Create project with name |
| `andrud list` | Show all available templates |
| `andrud info <template>` | View template details |

---

## ?? Usage Examples

### Interactive Project Creation

```bash
$ andrud create

? Enter your app name: MyAwesomeApp
? Enter package name: com.example.myawesomeapp
? Select template: kotlin-compose
? Project directory: ./projects

? Generating project structure...
? MyAwesomeApp created successfully!
```

### Create with Options

```bash
# Kotlin with Jetpack Compose
andrud new MyComposeApp -t kotlin-compose -p com.mydomain.app

# Kotlin with XML Views
andrud new MyKotlinApp -t kotlin-xml -p com.mydomain.app

# Java with XML Views
andrud new MyJavaApp -t java-xml -p com.mydomain.app

# Native C++ with NDK
andrud new MyNativeApp -t native-cpp -p com.mydomain.app
```

### List Templates

```bash
$ andrud list

+--------------------------------------------------------------+
¦                    Android Project Templates                   ¦
+--------------------------------------------------------------+

  1. Kotlin with XML Layouts
     Traditional Android Views with Kotlin...

  2. Kotlin with Jetpack Compose
     Modern declarative UI...

  3. Java with XML Layouts
     Traditional Android Views with Java...

  4. Kotlin with Native C++/NDK
     Native C++ development with JNI...
```

---

## ??? Project Structure

Generated projects include:

```
MyApp/
+-- app/
¦   +-- src/main/
¦   ¦   +-- java/          # Java/Kotlin source files
¦   ¦   +-- res/           # Resources (layouts, values, drawables)
¦   ¦   +-- AndroidManifest.xml
¦   ¦   +-- ...
¦   +-- build.gradle.kts   # App-level build config
¦   +-- proguard-rules.pro
+-- gradle/wrapper/        # Gradle wrapper files
+-- build.gradle.kts       # Root build config
+-- settings.gradle.kts    # Project settings
+-- gradle.properties      # Gradle properties
+-- .gitignore
+-- README.md
```

---

## ?? Configuration

### SDK Versions

```bash
# Custom SDK versions
andrud new MyApp --min-sdk 24 --target-sdk 35
```

### Features

```bash
# Disable specific features
andrud new MyApp --no-git --no-readme

# Skip dependency installation
andrud new MyApp --skip-install
```

---

## ??? Development

### Setup

```bash
# Clone the repository
git clone https://github.com/MurShidM01/andrud.git
cd andrud

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev -- create
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build TypeScript to JavaScript |
| `npm run dev` | Build and run in development |
| `npm run link` | Link package globally for testing |
| `npm test` | Run tests |

---

## ?? Dependencies

| Package | Purpose |
|---------|---------|
| [@clack/prompts](https://www.npmjs.com/package/@clack/prompts) | Beautiful interactive prompts |
| [cac](https://www.npmjs.com/package/cac) | Lightweight CLI argument parser |
| [fs-extra](https://www.npmjs.com/package/fs-extra) | Enhanced file system operations |
| [ora](https://www.npmjs.com/package/ora) | Elegant terminal spinners |
| [picocolors](https://www.npmjs.com/package/picocolors) | Terminal colors |
| [gradient-string](https://www.npmjs.com/package/gradient-string) | Gradient text effects |
| [update-notifier](https://www.npmjs.com/package/update-notifier) | Check for updates |

---

## ?? Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,typescript,androidstudio,kotlin,gradle,npm" alt="Tech Stack">
</p>

---



<p align="center">
  <img src="https://img.shields.io/github/repo-size/MurShidM01/andrud?style=for-the-badge" alt="repo size">
  <img src="https://img.shields.io/github/languages/code-size/MurShidM01/andrud?style=for-the-badge" alt="code size">
  <img src="https://img.shields.io/github/languages/count/MurShidM01/andrud?style=for-the-badge" alt="languages">
  <img src="https://img.shields.io/tokei/lines/github/MurShidM01/andrud?style=for-the-badge" alt="lines of code">
</p>

---

## ?? Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m '"'"'Add amazing feature'"'"'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ?? License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ?? Acknowledgments

- [Android Open Source Project](https://source.android.com/)
- [Jetpack Compose](https://developer.android.com/compose)
- [Kotlin](https://kotlinlang.org/)
- [Gradle](https://gradle.org/)

---

## ?? Contact

<p align="center">
  <a href="https://github.com/MurShidM01/andrud/issues">
    <img src="https://img.shields.io/badge/Issues-Open-green?style=for-the-badge&logo=github" alt="issues">
  </a>
  <a href="https://github.com/MurShidM01/andrud/discussions">
    <img src="https://img.shields.io/badge/Discussions-Q&A-blue?style=for-the-badge&logo=github" alt="discussions">
  </a>
</p>

---

<p align="center">
  <strong>Made with ?? by <a href="https://github.com/MurShidM01">MurShidM01</a></strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES2022-yellow?style=for-the-badge&logo=javascript&logoColor=black" alt="js">
  <img src="https://img.shields.io/badge/PowerShell-7+-blue?style=for-the-badge&logo=powershell" alt="powershell">
</p>

<p align="center">
  <substar>Star ? this repo if you find it useful!</substar>
</p>
