/**
 * Wrapper around @clack/prompts with proper TypeScript types
 */
import { select, text, multiselect, confirm, isCancel, cancel } from '@clack/prompts';
import { validateAppName, validatePackageNameInput, validateDirectoryPath } from '../utils/validation.js';
// Re-export core functions
export { select, text, multiselect, confirm, isCancel, cancel };
// Helper function to ask for app name
export async function askAppName(defaultValue) {
    const value = await text({
        message: '? What is the app name?',
        placeholder: 'MyAwesomeApp',
        defaultValue: defaultValue ?? 'MyAwesomeApp',
        validate: (input) => {
            const result = validateAppName(input);
            if (!result.valid) {
                return result.errors[0];
            }
            return undefined;
        }
    });
    if (isCancel(value)) {
        cancel();
        process.exit(0);
    }
    return value.trim();
}
// Helper function to ask for package name
export async function askPackageName(defaultValue) {
    const value = await text({
        message: '? What is the package name?',
        placeholder: 'com.example.myapp',
        defaultValue: defaultValue ?? 'com.example.myapp',
        validate: (input) => {
            const result = validatePackageNameInput(input);
            if (!result.valid) {
                return result.errors[0];
            }
            return undefined;
        }
    });
    if (isCancel(value)) {
        cancel();
        process.exit(0);
    }
    return value.trim().toLowerCase();
}
// Helper function to ask for project directory
export async function askDirectory(defaultValue) {
    const value = await text({
        message: '? In which directory should the project be created?',
        placeholder: './my-app',
        defaultValue: defaultValue ?? './my-app',
        validate: (input) => {
            const result = validateDirectoryPath(input);
            if (!result.valid) {
                return result.errors[0];
            }
            return undefined;
        }
    });
    if (isCancel(value)) {
        cancel();
        process.exit(0);
    }
    return value.trim();
}
// Template selection helper
export async function selectTemplate(templates) {
    const options = templates.map((t) => ({
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
export async function askMultiSelect(options, message = '? Select options', min, initialValues) {
    const formattedOptions = options.map((o) => ({
        label: o.label + (o.hint ? ` (${o.hint})` : ''),
        value: o.value
    }));
    const value = await multiselect({
        message,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: formattedOptions,
        required: min !== undefined && min > 0,
        ...(initialValues !== undefined ? { initialValues } : {})
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