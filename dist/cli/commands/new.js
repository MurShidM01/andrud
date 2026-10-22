/**
 * New project creation command with interactive prompts and full CLI options
 */
import { select, text, multiselect, isCancel, cancel } from '@clack/prompts';
import { printWelcome, printSuccess, printError, printSection, printKeyValue, printGoodbye, printSteps } from '../../ui/output.js';
import { validateAppName, validatePackageStructure, validateDirectoryPath, validateAndroidMinSdk, validateAndroidTargetSdk, deriveDefaultPackageName } from '../../utils/validation.js';
import { generateProject } from '../../core/generator.js';
import { buildDefaultProjectContext, buildTemplateContext } from '../../core/context.js';
import { parseKmpPlatforms } from '../../core/config.js';
import { exists, resolveProjectDirectory } from '../../utils/filesystem.js';
import { getTemplateMetadata, getAllTemplates } from '../../templates/index.js';
import pc from 'picocolors';
function shouldUseDefaults(options) {
    return options.yes === true || !process.stdin.isTTY;
}
function parseSdkOption(value, label, validator) {
    if (value === undefined)
        return undefined;
    const validation = validator(value);
    if (!validation.valid) {
        throw new Error(`${label}: ${validation.errors.join(', ')}`);
    }
    return typeof value === 'number' ? value : Number.parseInt(String(value).trim(), 10);
}
function packageOption(options) {
    return options.packageName ?? options.package;
}
/**
 * Create a new Android project
 */
export async function createNewCommand(name, options = {}) {
    try {
        // Print welcome banner
        printWelcome();
        // Get all available templates
        const templates = getAllTemplates();
        // Step 1: Select template
        let selectedTemplate;
        if (options.template) {
            const meta = getTemplateMetadata(options.template);
            if (!meta) {
                printError(`Unknown template: ${options.template}`);
                console.log('Available templates:');
                templates.forEach((t) => console.log(`  - ${t.id}`));
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
                label: `${t.name}`,
                value: t.id,
                hint: t.keywords.slice(0, 2).join(', ')
            }));
            const templateResult = await select({
                message: '? Select a project template',
                options: templateOptions
            });
            if (isCancel(templateResult)) {
                cancel();
                return;
            }
            selectedTemplate = templateResult;
        }
        printSection(`Template: ${selectedTemplate}`);
        // Step 2: Get app name
        let appName;
        if (name) {
            const validation = validateAppName(name);
            if (!validation.valid) {
                printError('Invalid app name', validation.errors.join(', '));
                process.exitCode = 1;
                return;
            }
            appName = validation.normalized ?? name;
        }
        else if (shouldUseDefaults(options)) {
            appName = 'MyAwesomeApp';
        }
        else {
            const nameResult = await text({
                message: '? What is the app name?',
                placeholder: 'MyAwesomeApp',
                defaultValue: 'MyAwesomeApp',
                validate: (value) => {
                    const result = validateAppName(value);
                    if (!result.valid) {
                        return result.errors[0];
                    }
                    return undefined;
                }
            });
            if (isCancel(nameResult)) {
                cancel();
                return;
            }
            const validation = validateAppName(nameResult);
            if (!validation.valid) {
                printError('Invalid app name', validation.errors.join(', '));
                process.exitCode = 1;
                return;
            }
            appName = validation.normalized ?? nameResult;
        }
        // Step 3: Get package name
        let packageName;
        const packageInput = packageOption(options);
        if (packageInput) {
            const validation = validatePackageStructure(packageInput);
            if (!validation.valid) {
                printError('Invalid package name', validation.errors.join(', '));
                process.exitCode = 1;
                return;
            }
            packageName = packageInput.trim().toLowerCase();
        }
        else {
            const defaultPackage = deriveDefaultPackageName(appName);
            if (shouldUseDefaults(options)) {
                packageName = defaultPackage;
            }
            else {
                const packageResult = await text({
                    message: '? What is the package name?',
                    placeholder: 'com.example.myapp',
                    defaultValue: defaultPackage,
                    validate: (value) => {
                        const result = validatePackageStructure(value);
                        if (!result.valid) {
                            return result.errors[0];
                        }
                        return undefined;
                    }
                });
                if (isCancel(packageResult)) {
                    cancel();
                    return;
                }
                const validation = validatePackageStructure(packageResult);
                if (!validation.valid) {
                    printError('Invalid package name', validation.errors.join(', '));
                    process.exitCode = 1;
                    return;
                }
                packageName = packageResult.trim().toLowerCase();
            }
        }
        // Step 4: Get project directory
        let projectDirectory;
        const defaultDir = './';
        if (options.directory) {
            const validation = validateDirectoryPath(options.directory);
            if (!validation.valid) {
                printError('Invalid directory', validation.errors.join(', '));
                process.exitCode = 1;
                return;
            }
            projectDirectory = resolveProjectDirectory(validation.normalized ?? options.directory, appName);
        }
        else if (shouldUseDefaults(options)) {
            projectDirectory = resolveProjectDirectory(defaultDir, appName);
        }
        else {
            const dirResult = await text({
                message: '? Parent directory for the project?',
                placeholder: './Android-Apps',
                defaultValue: defaultDir,
                validate: (value) => {
                    const result = validateDirectoryPath(value);
                    if (!result.valid) {
                        return result.errors[0];
                    }
                    return undefined;
                }
            });
            if (isCancel(dirResult)) {
                cancel();
                return;
            }
            const validation = validateDirectoryPath(dirResult);
            if (!validation.valid) {
                printError('Invalid directory', validation.errors.join(', '));
                process.exitCode = 1;
                return;
            }
            projectDirectory = resolveProjectDirectory(validation.normalized ?? dirResult, appName);
        }
        // Step 5: Optional features
        let selectedFeatures;
        const defaultFeatures = ['git', 'readme', 'androidX', 'kotlinDsl'];
        if (shouldUseDefaults(options)) {
            selectedFeatures = defaultFeatures;
        }
        else {
            const featureOptions = [
                { label: 'Git ignore file', value: 'git', hint: 'Generate .gitignore' },
                { label: 'README.md', value: 'readme', hint: 'Generate readme' },
                { label: 'AndroidX libraries', value: 'androidX', hint: 'Use AndroidX (recommended)' },
                { label: 'Kotlin DSL', value: 'kotlinDsl', hint: 'Use Kotlin DSL for Gradle' }
            ];
            const featuresResult = await multiselect({
                message: '? Select additional features (optional)',
                options: featureOptions,
                initialValues: defaultFeatures,
                required: false
            });
            if (isCancel(featuresResult)) {
                cancel();
                return;
            }
            selectedFeatures = featuresResult;
        }
        const features = {
            git: options.git === false ? false : selectedFeatures.includes('git'),
            readme: options.readme === false ? false : selectedFeatures.includes('readme'),
            androidX: selectedFeatures.includes('androidX'),
            kotlinDsl: selectedFeatures.includes('kotlinDsl')
        };
        const minSdk = parseSdkOption(options.minSdk, '--min-sdk', validateAndroidMinSdk);
        const targetSdk = parseSdkOption(options.targetSdk, '--target-sdk', validateAndroidTargetSdk);
        if (minSdk !== undefined && targetSdk !== undefined && minSdk > targetSdk) {
            printError('Invalid SDK configuration', `--min-sdk (${minSdk}) cannot be greater than --target-sdk (${targetSdk})`);
            process.exitCode = 1;
            return;
        }
        const kmpPlatforms = selectedTemplate === 'kotlin-multiplatform' && options.platforms
            ? parseKmpPlatforms(options.platforms)
            : undefined;
        // Build context
        const baseContext = buildDefaultProjectContext(appName, packageName, projectDirectory, selectedTemplate, features, minSdk, targetSdk, kmpPlatforms);
        const context = buildTemplateContext(baseContext);
        // Check if directory exists
        const dirExists = await exists(projectDirectory);
        if (dirExists && !options.force) {
            printError(`Directory "${projectDirectory}" already exists`, 'Use --force to overwrite existing files');
            process.exitCode = 1;
            return;
        }
        // Generate project
        console.log('');
        printSection('Generating Project');
        const result = await generateProject(context, {
            overwrite: options.force,
            dryRun: false,
            skipInstall: options.skipInstall,
            verbose: options.verbose ?? false
        });
        if (result.success) {
            printSuccess('Project generated successfully!');
            printKeyValue([
                { key: 'Project', value: appName },
                { key: 'Package', value: packageName },
                { key: 'Template', value: selectedTemplate },
                { key: 'Location', value: projectDirectory },
                { key: 'Files created', value: result.generatedFiles.length.toString() },
                { key: 'Duration', value: `${(result.duration / 1000).toFixed(1)}s` }
            ]);
            console.log('');
            printSteps([
                `cd ${projectDirectory}`,
                'Open in Android Studio: studio .',
                'Or build from command line: ./gradlew assembleDebug'
            ]);
            printGoodbye(true);
        }
        else {
            printError('Project generation failed');
            if (result.errors.length > 0) {
                console.log('');
                result.errors.forEach((err) => {
                    console.log(`  ${pc.red('•')} ${err.file ? `${err.file}: ` : ''}${err.message}`);
                });
            }
            printGoodbye(false);
            process.exitCode = 1;
        }
    }
    catch (error) {
        printError('An unexpected error occurred', error.message);
        if (process.env.DEBUG || process.env.VERBOSE) {
            console.error(error);
        }
        printGoodbye(false);
        process.exitCode = 1;
    }
}
//# sourceMappingURL=new.js.map