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
    validate: (value: string) => {
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

  return value as string;
}

// Helper function to ask for package name
export async function askPackageName(defaultValue?: string): Promise<string> {
  const value = await text({
    message: '? What is the package name?',
    placeholder: 'com.example.myapp',
    defaultValue: defaultValue ?? 'com.example.myapp',
    validate: (value: string) => {
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

  return value as string;
}

// Helper function to ask for project directory
export async function askDirectory(defaultValue?: string): Promise<string> {
  const value = await text({
    message: '? In which directory should the project be created?',
    placeholder: './my-app',
    defaultValue: defaultValue ?? './my-app',
    validate: (value: string) => {
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

  return value as string;
}

// Template selection helper
export async function selectTemplate<T extends string>(
  templates: Array<{ label: string; value: T; hint?: string }>
): Promise<T> {
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

  return value as T;
}

// Multi-select helper
export async function askMultiSelect<T>(
  options: Array<{ label: string; value: T; hint?: string }>,
  message: string = '? Select options',
  min?: number
): Promise<T[]> {
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