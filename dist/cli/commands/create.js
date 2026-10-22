/**
 * Clean, minimal Vite-style project creation command
 */
import { text, select, confirm, isCancel, cancel, spinner } from '@clack/prompts';
import { generateProject } from '../../core/generator.js';
import { buildDefaultProjectContext, buildTemplateContext } from '../../core/context.js';
import { parseKmpPlatforms } from '../../core/config.js';
import { exists, resolveProjectDirectory } from '../../utils/filesystem.js';
import { validateAppName, validatePackageNameInput, validateDirectoryPath, deriveDefaultPackageName } from '../../utils/validation.js';
import { getAllTemplates, getTemplateMetadata } from '../../templates/index.js';
import pc from 'picocolors';
function shouldUseDefaults(options) {
    return options.yes === true || !process.stdin.isTTY;
}
/**
 * Create a new Android project with clean minimal UI
 */
export async function createCommand(nameOrOptions, maybeOptions = {}) {
    const nameArg = typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions?.name;
    const options = typeof nameOrOptions === 'object' && nameOrOptions !== null ? nameOrOptions : maybeOptions;
    console.log('');
    // ============================================
    // Step 1: App Name
    // ============================================
    let appName;
    if (nameArg) {
        const validation = validateAppName(nameArg);
        if (!validation.valid) {
            console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
            process.exitCode = 1;
            return;
        }
        appName = validation.normalized ?? nameArg.trim();
    }
    else if (shouldUseDefaults(options)) {
        appName = 'MyApp';
    }
    else {
        const nameResult = await text({
            message: '  ? Project name:',
            placeholder: 'MyApp',
            defaultValue: 'MyApp',
            validate: (val) => {
                const res = validateAppName(val);
                return res.valid ? undefined : res.errors[0];
            }
        });
        if (isCancel(nameResult)) {
            cancel();
            return;
        }
        const validation = validateAppName(nameResult);
        if (!validation.valid) {
            console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
            process.exitCode = 1;
            return;
        }
        appName = validation.normalized ?? nameResult.trim();
    }
    // ============================================
    // Step 2: Template Selection
    // ============================================
    const templates = getAllTemplates();
    let selectedTemplate;
    if (options.template) {
        const meta = getTemplateMetadata(options.template);
        if (!meta) {
            console.log(pc.red(`\n  ✘ Unknown template: ${options.template}\n`));
            process.exitCode = 1;
            return;
        }
        selectedTemplate = meta.id;
    }
    else if (shouldUseDefaults(options)) {
        selectedTemplate = 'kotlin-compose';
    }
    else {
        const templateOptions = templates.map((t) => ({
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
        selectedTemplate = templateResult;
    }
    const selectedMeta = getTemplateMetadata(selectedTemplate);
    // ============================================
    // Step 3: Package Name
    // ============================================
    const defaultPackage = deriveDefaultPackageName(appName);
    const pkgOption = options.packageName ?? options.package;
    let packageName;
    if (pkgOption) {
        const validation = validatePackageNameInput(pkgOption);
        if (!validation.valid) {
            console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
            process.exitCode = 1;
            return;
        }
        packageName = pkgOption.trim().toLowerCase();
    }
    else if (shouldUseDefaults(options)) {
        packageName = defaultPackage;
    }
    else {
        const packageResult = await text({
            message: '  ? Package name:',
            placeholder: defaultPackage,
            defaultValue: defaultPackage,
            validate: (val) => {
                const res = validatePackageNameInput(val);
                return res.valid ? undefined : res.errors[0];
            }
        });
        if (isCancel(packageResult)) {
            cancel();
            return;
        }
        const validation = validatePackageNameInput(packageResult);
        if (!validation.valid) {
            console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
            process.exitCode = 1;
            return;
        }
        packageName = packageResult.trim().toLowerCase();
    }
    // ============================================
    // Step 4: Directory
    // ============================================
    const defaultBaseDir = './Android-Apps';
    let baseDir;
    if (options.directory) {
        const validation = validateDirectoryPath(options.directory);
        if (!validation.valid) {
            console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
            process.exitCode = 1;
            return;
        }
        baseDir = validation.normalized ?? options.directory.trim();
    }
    else if (shouldUseDefaults(options)) {
        baseDir = defaultBaseDir;
    }
    else {
        const dirResult = await text({
            message: '  ? Parent directory for the project:',
            placeholder: defaultBaseDir,
            defaultValue: defaultBaseDir,
            validate: (val) => {
                const res = validateDirectoryPath(val);
                return res.valid ? undefined : res.errors[0];
            }
        });
        if (isCancel(dirResult)) {
            cancel();
            return;
        }
        const validation = validateDirectoryPath(dirResult);
        if (!validation.valid) {
            console.log(pc.red(`\n  ✘ ${validation.errors[0]}\n`));
            process.exitCode = 1;
            return;
        }
        baseDir = validation.normalized ?? dirResult.trim();
    }
    const projectDirectory = resolveProjectDirectory(baseDir, appName);
    // Check if directory exists
    const dirExists = await exists(projectDirectory);
    if (dirExists && !options.force) {
        console.log(pc.red(`\n  ✘ Directory already exists: ${projectDirectory}`));
        console.log(pc.gray('    Use --force to overwrite\n'));
        process.exitCode = 1;
        return;
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
    if (!shouldUseDefaults(options)) {
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
    }
    // ============================================
    // Generate Project
    // ============================================
    console.log('');
    const s = process.stdout.isTTY ? spinner() : null;
    s?.start('  Creating project...');
    let kmpPlatforms;
    if (selectedTemplate === 'kotlin-multiplatform' && options.platforms) {
        try {
            kmpPlatforms = parseKmpPlatforms(options.platforms);
        }
        catch (error) {
            s?.stop('  Failed!');
            console.log(pc.red(`\n  ✘ ${error.message}\n`));
            process.exitCode = 1;
            return;
        }
    }
    const baseContext = buildDefaultProjectContext(appName, packageName, projectDirectory, selectedTemplate, { git: true, readme: true, androidX: true, kotlinDsl: true }, undefined, undefined, kmpPlatforms);
    const context = buildTemplateContext(baseContext);
    const result = await generateProject(context, {
        overwrite: options.force ?? false,
        dryRun: false,
        skipInstall: false,
        verbose: false
    });
    s?.stop('  Done!');
    if (result.success) {
        console.log('');
        console.log(pc.green(`  ✓ Project "${appName}" created`));
        console.log(pc.gray('─'.repeat(50)));
        console.log('');
        console.log(pc.gray(`  cd ${projectDirectory}`));
        if (selectedTemplate === 'kotlin-multiplatform') {
            console.log(pc.gray('  ./kotlin build'));
        }
        else {
            console.log(pc.gray('  ./gradlew assembleDebug'));
        }
        console.log(pc.gray('  studio .'));
        console.log('');
    }
    else {
        console.log(pc.red('\n  ✘ Failed to create project'));
        result.errors.forEach((err) => {
            console.log(`    ${pc.red('•')} ${err.file ? `${err.file}: ` : ''}${err.message}`);
        });
        console.log('');
        process.exitCode = 1;
    }
}
//# sourceMappingURL=create.js.map