/**
 * Type definitions for UI components and utilities
 */

export type StyleType = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted';

export interface SpinnerOptions {
  text?: string;
  color?: string;
}

export interface TableColumn<T> {
  header: string;
  accessor: (row: T) => string;
  width?: number;
}

export interface ConfirmationOptions {
  message: string;
  initialValue?: boolean;
}

export interface SelectOption<T> {
  label: string;
  value: T;
  hint?: string;
}

export interface TextInputOptions {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  validate?: (value: string) => string | null;
}

export interface MultiSelectOptions<T> {
  message: string;
  options: SelectOption<T>[];
  min?: number;
  max?: number;
}