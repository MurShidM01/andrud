/**
 * Clean, minimal Vite-style project creation command
 */
import { text, select, confirm, isCancel, cancel, spinner } from '@clack/prompts';
import { generateProject } from '../../core/generator.js';
import { buildDefaultProjectContext, buildTemplateContext } from '../../core/context.js';
import { exists } from '../../utils/filesystem.js';
import { getAllTemplates, getTemplateMetadata } from '../../templates/index.js';
import pc from 'picocolors';
import { resolve, isAbsolute } from 'path';
import { platform } from 'os';
/**
 * Normalize path for cross-platform compatibility
 */
function normalizePath(path) {
    if (!path || path.trim() === '') {
        return path;
    }
    const trimmed = path.trim();
    // On Windows, convert Unix-style paths like /d/... to D:\...
    if (platform() === 'win32') {
        const unixPathMatch = trimmed.match(/^\/([a-zA-Z])\/(.*)$/);
        if (unixPathMatch && unixPathMatch[1] && unixPathMatch[2]) {
            return `${unixPathMatch[1].toUpperCase()}:\\${unixPathMatch[2].replace(/\//g, '\\')}`;
        }
    }
    // Force relative paths to be relative to current directory
    if (!isAbsolute(trimmed)) {
        return resolve(trimmed);
    }
    return trimmed;
}
/**
 * Create a new Android project with clean minimal UI
 */
export async function createCommand(options = {}) {
    // ============================================
    // Step 1: App Name
    // ============================================
    console.log('');
    let appName;
    const nameResult = await text({
        message: '  ? Project name:',
        placeholder: 'MyApp',
        defaultValue: 'MyApp',
    });
    if (isCancel(nameResult)) {
        cancel();
        return;
    }
    appName = nameResult.trim();
    if (!appName || !/^[a-zA-Z]/.test(appName)) {
        console.log(pc.red('\n  ✘ Project name must start with a letter\n'));
        return;
    }
    // ============================================
    // Step 2: Template Selection
    // ============================================
    const templates = getAllTemplates();
    const templateOptions = templates.map(t => ({
        label: t.name,
        value: t.id,
        hint: t.language === 'kotlin' ? 'Kotlin' : 'Java'
    }));
    const templateResult = await select({
        message: '  ? Select template:',
        options: templateOptions
    });
    if (isCancel(templateResult)) {
        cancel();
        return;
    }
    const selectedTemplate = templateResult;
    const selectedMeta = getTemplateMetadata(selectedTemplate);
    // ============================================
    // Step 3: Package Name
    // ============================================
    const defaultPackage = `com.example.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const packageResult = await text({
        message: '  ? Package name:',
        placeholder: defaultPackage,
        defaultValue: defaultPackage,
    });
    if (isCancel(packageResult)) {
        cancel();
        return;
    }
    const packageName = packageResult.trim().toLowerCase();
    if (!packageName || !/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName)) {
        console.log(pc.red('\n  ✘ Invalid package name format (e.g., com.example.myapp)\n'));
        return;
    }
    // ============================================
    // Step 4: Directory
    // ============================================
    const dirResult = await text({
        message: '  ? Where to create the project:',
        placeholder: 'D:\\Projects\\Android',
        defaultValue: 'D:\\Projects\\Android',
    });
    if (isCancel(dirResult)) {
        cancel();
        return;
    }
    // Normalize and append app name as project folder
    let baseDir = dirResult.trim();
    if (!baseDir) {
        console.log(pc.red('\n  ✘ Directory path cannot be empty\n'));
        return;
    }
    baseDir = normalizePath(baseDir);
    // Ensure the directory path ends properly (no trailing slash issues)
    let projectDirectory;
    // If the path is ./something, append app name
    if (baseDir.startsWith('./') || baseDir === '.') {
        const baseName = baseDir === '.' ? '' : baseDir.slice(1).replace(/^[\\\/]/, '');
        projectDirectory = baseName
            ? `${baseName}/${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
            : `./${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }
    else {
        // For absolute paths, append app name + sanitize
        projectDirectory = `${baseDir}\\${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    }
    // Check if directory exists
    const dirExists = await exists(projectDirectory);
    if (dirExists) {
        if (!options.force) {
            console.log(pc.red(`\n  ✘ Directory already exists: ${projectDirectory}`));
            console.log(pc.gray('    Use --force to overwrite\n'));
            return;
        }
    }
    // ============================================
    // Step 5: Summary & Confirm
    // ============================================
    console.log('');
    console.log(pc.gray('─').repeat(50));
    console.log('');
    console.log(`   ${pc.cyan('Project:')} ${pc.bold(appName)}`);
    console.log(`   ${pc.cyan('Template:')} ${selectedMeta?.name}`);
    console.log(`   ${pc.cyan('Package:')} ${packageName}`);
    console.log(`   ${pc.cyan('Path:')} ${projectDirectory}`);
    console.log('');
    const shouldCreate = await confirm({
        message: '  Create project?',
        initialValue: true
    });
    if (isCancel(shouldCreate)) {
        cancel();
        return;
    }
    if (!shouldCreate) {
        console.log(pc.gray('\n  Cancelled.\n'));
        return;
    }
    // ============================================
    // Generate Project
    // ============================================
    console.log('');
    const s = spinner();
    s.start('  Creating project...');
    // Build context
    const baseContext = buildDefaultProjectContext(appName, packageName, projectDirectory, selectedTemplate, { git: true, readme: true, androidX: true, kotlinDsl: true });
    const context = buildTemplateContext({
        appName: baseContext.appName,
        packageName: baseContext.packageName,
        projectDirectory: baseContext.projectDirectory,
        template: baseContext.template,
        uiFramework: baseContext.uiFramework,
        language: baseContext.language,
        android: baseContext.android,
        gradle: baseContext.gradle,
        features: baseContext,
        nativeCpp: baseContext.nativeCpp
    });
    // Generate the project
    const result = await generateProject(context, {
        overwrite: options.force ?? false,
        dryRun: false,
        skipInstall: false,
        verbose: false
    });
    s.stop('  Done!');
    if (result.success) {
        console.log('');
        console.log(pc.green(`  ✓ Project "${appName}" created`));
        console.log(pc.gray('─'.repeat(50)));
        console.log('');
        console.log(pc.gray(`  cd ${projectDirectory}`));
        console.log(pc.gray('  ./gradlew assembleDebug'));
        console.log(pc.gray('  studio .'));
        console.log('');
    }
    else {
        console.log(pc.red('\n  ✘ Failed to create project'));
        result.errors.forEach(err => {
            console.log(`    ${pc.red('•')} ${err.file ? `${err.file}: ` : ''}${err.message}`);
        });
        console.log('');
    }
}
//# sourceMappingURL=create.js.map