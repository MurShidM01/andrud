# Contributing to andrud

Thank you for your interest in contributing to **andrud**! 🎉

---

## 🤝 How to Contribute

### 1. Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/MurShidM01/andrud/issues) with:

- Clear description of the issue/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment (Node.js version, OS, etc.)

### 2. Pull Requests

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/andrud.git
   cd andrud
   ```
3. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install** dependencies:
   ```bash
   npm install
   ```
5. **Make** your changes
6. **Build** and test:
   ```bash
   npm run build
   npm run dev -- list
   ```
7. **Commit** your changes:
   ```bash
   git commit -m "Add: your feature description"
   ```
8. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
9. **Open** a Pull Request

---

## 📋 Development Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Quick Start

```bash
# Clone repo
git clone https://github.com/MurShidM01/andrud.git
cd andrud

# Install dependencies
npm install

# Build project
npm run build

# Run in dev mode
npm run dev -- create

# Link for global testing
npm run link
```

---

## 🧪 Testing

Before submitting a PR, please test your changes:

```bash
# Test all commands
npm run dev -- --help
npm run dev -- list
npm run dev -- info kotlin-compose

# Create a test project
cd /tmp
npm run dev -- new TestApp -t kotlin-xml -p com.test.app
```

---

## 📐 Code Style

- Use **TypeScript** for all new code
- Follow existing code patterns
- Add types for new functions
- Keep functions small and focused

---

## 🔍 Code Review Process

All PRs will be reviewed by the maintainer. Please ensure:

- [ ] Code builds without errors
- [ ] Tests pass (if applicable)
- [ ] No new TypeScript errors introduced
- [ ] Changes are minimal and focused
- [ ] Commit messages are descriptive

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 💬 Need Help?

- Open a [discussion](https://github.com/MurShidM01/andrud/discussions)
- Check [existing issues](https://github.com/MurShidM01/andrud/issues)

---

**Happy coding!** 🚀
