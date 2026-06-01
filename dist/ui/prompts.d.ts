/**
 * Wrapper around @clack/prompts with proper TypeScript types
 */
import { select, text, multiselect, confirm, isCancel, cancel, type SelectOptions, type TextOptions, type MultiSelectOptions, type ConfirmOptions } from '@clack/prompts';
export { select, text, multiselect, confirm, isCancel, cancel, type SelectOptions, type TextOptions, type MultiSelectOptions, type ConfirmOptions };
export declare function askAppName(defaultValue?: string): Promise<string>;
export declare function askPackageName(defaultValue?: string): Promise<string>;
export declare function askDirectory(defaultValue?: string): Promise<string>;
export declare function selectTemplate<T extends string>(templates: Array<{
    label: string;
    value: T;
    hint?: string;
}>): Promise<T>;
export declare function askMultiSelect<T>(options: Array<{
    label: string;
    value: T;
    hint?: string;
}>, message?: string, min?: number): Promise<T[]>;
export declare function askConfirmation(message: string, initialValue?: boolean): Promise<boolean>;
//# sourceMappingURL=prompts.d.ts.map