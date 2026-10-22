/**
 * Color and text formatting utilities using picocolors and gradient-string
 */

import pc from 'picocolors';
import gradient from 'gradient-string';
import type { StyleType } from './types.js';

// Pre-initialized singleton gradient instances
const teenGradientInstance = gradient('#00C9FF', '#92FE9D');
const coolGradientInstance = gradient('#667eea', '#764ba2');
const passionGradientInstance = gradient('#ee0979', '#ff6a00');

// Style function to apply color based on type
export function style(text: string, type: StyleType): string {
  switch (type) {
    case 'primary':
      return pc.cyan(text);
    case 'success':
      return pc.green(text);
    case 'warning':
      return pc.yellow(text);
    case 'error':
      return pc.red(text);
    case 'info':
      return pc.blue(text);
    case 'muted':
      return pc.gray(text);
    default:
      return text;
  }
}

// Text formatting functions
export const bold = (text: string): string => pc.bold(text);
export const dim = (text: string): string => pc.dim(text);
export const underline = (text: string): string => pc.underline(text);
export const inverse = (text: string): string => pc.inverse(text);
export const italic = (text: string): string => pc.italic(text);

// Color functions
export const primary = (text: string): string => pc.cyan(text);
export const success = (text: string): string => pc.green(text);
export const warning = (text: string): string => pc.yellow(text);
export const error = (text: string): string => pc.red(text);
export const info = (text: string): string => pc.blue(text);
export const muted = (text: string): string => pc.gray(text);

// Aliases for backward compatibility
export const cyan = (text: string): string => pc.cyan(text);
export const green = (text: string): string => pc.green(text);
export const yellow = (text: string): string => pc.yellow(text);
export const red = (text: string): string => pc.red(text);
export const blue = (text: string): string => pc.blue(text);
export const gray = (text: string): string => pc.gray(text);

// Gradient functions using gradient-string
export function gradientTeen(text: string): string {
  return teenGradientInstance(text);
}

export function gradientRainbow(text: string): string {
  return gradient.rainbow(text);
}

export function gradientCool(text: string): string {
  return coolGradientInstance(text);
}

export function gradientPassion(text: string): string {
  return passionGradientInstance(text);
}

// Section formatting
export const header = (text: string): string => {
  return pc.bold(pc.cyan(`\n${text}\n`));
};

export const section = (text: string): string => {
  return pc.bold(pc.white(text));
};

export const subsection = (text: string): string => {
  return pc.dim(text);
};

// Symbol functions for visual elements
export const checkmark = (text?: string): string => {
  const symbol = pc.green('✓');
  return text ? `${symbol} ${text}` : symbol;
};

export const crossmark = (text?: string): string => {
  const symbol = pc.red('✗');
  return text ? `${symbol} ${text}` : symbol;
};

// Arrow and bullet functions
export const bullet = (text: string): string => {
  return `${pc.gray('•')} ${text}`;
};

export const numbered = (num: number, text: string): string => {
  return `${pc.gray(`${num}.`)} ${text}`;
};

export const arrow = (text: string): string => {
  return `${pc.gray('→')} ${text}`;
};

export const rightArrow = (from: string, to: string): string => {
  return `${from} ${pc.gray('→')} ${to}`;
};

// Progress bar
export function progressBar(current: number, total: number, width: number = 20): string {
  const safeWidth = Math.max(1, width);
  const ratio = total > 0 ? current / total : 0;
  const percentage = Math.min(Math.max(ratio, 0), 1);
  const filled = Math.round(percentage * safeWidth);
  const empty = safeWidth - filled;
  const filledBar = pc.green('█'.repeat(filled));
  const emptyBar = pc.gray('░'.repeat(empty));
  const percentText = pc.cyan(`${Math.round(percentage * 100)}%`);
  return `${filledBar}${emptyBar} ${percentText}`;
}

// Separator line
export function printSeparator(char: string = '─', length: number = 60): string {
  return pc.gray(char.repeat(Math.max(0, length)));
}

// Terminal control functions
export function clearLine(): void {
  process.stdout.write('\r\x1B[K');
}

export function cursorHide(): void {
  process.stdout.write('\x1B[?25l');
}

export function cursorShow(): void {
  process.stdout.write('\x1B[?25h');
}
