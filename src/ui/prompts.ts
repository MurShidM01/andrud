/**
 * Wrapper around @clack/prompts with proper TypeScript types
 */

import {
  select,
  text,
  multiselect,
  confirm,
  isCancel,
  cancel,
  type SelectOptions,
  type TextOptions,
  type MultiSelectOptions,
  type ConfirmOptions
} from '@clack/prompts';
import {
  validateAppName,
  validatePackageNameInput,
  validateDirectoryPath
} from '../utils/validation.js';

// Re-export core functions
export {
  select,
  text,
  multiselect,
  confirm,
  isCancel,
  cancel,
  type SelectOptions,
  type TextOptions,
  type MultiSelectOptions,
  type ConfirmOptions
};

// Helper function to ask for app name
export async function askAppName(defaultValue?: string): Promise<string> {
  const value = await text({
    message: '? What is the app name?',
    placeholder: 'MyAwesomeApp',
    defaultValue: defaultValue ?? 'MyAwesomeApp',
    validate: (input: string) => {
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

  return (value as string).trim();
}

// Helper function to ask for package name
export async function askPackageName(defaultValue?: string): Promise<string> {
  const value = await text({
    message: '? What is the package name?',
    placeholder: 'com.example.myapp',
    defaultValue: defaultValue ?? 'com.example.myapp',
    validate: (input: string) => {
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

  return (value as string).trim().toLowerCase();
}

// Helper function to ask for project directory
export async function askDirectory(defaultValue?: string): Promise<string> {
  const value = await text({
    message: '? In which directory should the project be created?',
    placeholder: './my-app',
    defaultValue: defaultValue ?? './my-app',
    validate: (input: string) => {
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

  return (value as string).trim();
}

// Template selection helper
export async function selectTemplate<T extends string>(
  templates: Array<{ label: string; value: T; hint?: string }>
): Promise<T> {
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

  return value as T;
}

// Multi-select helper
export async function askMultiSelect<T>(
  options: Array<{ label: string; value: T; hint?: string }>,
  message: string = '? Select options',
  min?: number,
  initialValues?: T[]
): Promise<T[]> {
  const formattedOptions = options.map((o) => ({
    label: o.label + (o.hint ? ` (${o.hint})` : ''),
    value: o.value
  }));

  const value = await multiselect({
    message,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: formattedOptions as any,
    required: min !== undefined && min > 0,
    ...(initialValues !== undefined ? { initialValues } : {})
  });

  if (isCancel(value)) {
    cancel();
    process.exit(0);
  }

  return value as T[];
}

// Confirmation helper
export async function askConfirmation(
  message: string,
  initialValue: boolean = false
): Promise<boolean> {
  const value = await confirm({
    message: `? ${message}`,
    initialValue
  });

  if (isCancel(value)) {
    cancel();
    process.exit(0);
  }

  return value as boolean;
}
