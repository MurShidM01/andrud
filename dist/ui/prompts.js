/**
 * Wrapper around @clack/prompts with proper TypeScript types
 */
import { select, text, multiselect, confirm, isCancel, cancel } from '@clack/prompts';
// Re-export core functions
export { select, text, multiselect, confirm, isCancel, cancel };
// Helper function to ask for app name
export async function askAppName(defaultValue) {
    const value = await text({
        message: '? What is the app name?',
        placeholder: 'MyAwesomeApp',
        defaultValue: defaultValue ?? 'MyAwesomeApp',
        validate: (value) => {
            if (!value || value.trim().length === 0) {
                return 'App name cannot be empty';
            }
            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
                return 'App name must start with a letter and contain only letters, numbers, and underscores';
            }
            return undefined;
        }
    });
    if (isCancel(value)) {
        cancel();
        process.exit(0);
    }
    return value;
}
// Helper function to ask for package name
export async function askPackageName(defaultValue) {
    const value = await text({
        message: '? What is the package name?',
        placeholder: 'com.example.myapp',
        defaultValue: defaultValue ?? 'com.example.myapp',
        validate: (value) => {
            if (!value || value.trim().length === 0) {
                return 'Package name cannot be empty';
            }
            if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(value)) {
                return 'Package name must be a valid domain structure (e.g., com.example.myapp)';
            }
            return undefined;
        }
    });
    if (isCancel(value)) {
        cancel();
        process.exit(0);
    }
    return value;
}
// Helper function to ask for project directory
export async function askDirectory(defaultValue) {
    const value = await text({
        message: '? In which directory should the project be created?',
        placeholder: './my-app',
        defaultValue: defaultValue ?? './my-app',
        validate: (value) => {
            if (!value || value.trim().length === 0) {
                return 'Directory path cannot be empty';
            }
            if (value.includes('..')) {
                return 'Directory path cannot contain ".." to prevent directory traversal';
            }
            return undefined;
        }
    });
    if (isCancel(value)) {
        cancel();
        process.exit(0);
    }
    return value;
}
// Template selection helper
export async function selectTemplate(templates) {
    const options = templates.map(t => ({
        label: t.label + (t.hint ? ` ${t.hint}` : ''),
        value: t.value
    }));
    const value = await select({
        message: '? Select a project template',
        options
    });
    if (isCancel(value)) {
        cancel();
        process.exit(0);
    }
    return value;
}
// Multi-select helper
export async function askMultiSelect(options, message = '? Select options', min) {
    const formattedOptions = options.map(o => ({
        label: o.label + (o.hint ? ` (${o.hint})` : ''),
        value: o.value
    }));
    const value = await multiselect({
        message,
        options: formattedOptions,
        ...(min !== undefined ? { min } : {})
    });
    if (isCancel(value)) {
        cancel();
        process.exit(0);
    }
    return value;
}
// Confirmation helper
export async function askConfirmation(message, initialValue = false) {
    const value = await confirm({
        message: `? ${message}`,
        initialValue
    });
    if (isCancel(value)) {
        cancel();
        process.exit(0);
    }
    return value;
}
//# sourceMappingURL=prompts.js.map