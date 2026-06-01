/**
 * Color and text formatting utilities using picocolors and gradient-string
 */
export declare function style(text: string, type: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted'): string;
export declare const bold: (text: string) => string;
export declare const dim: (text: string) => string;
export declare const underline: (text: string) => string;
export declare const inverse: (text: string) => string;
export declare const italic: (text: string) => string;
export declare const primary: (text: string) => string;
export declare const success: (text: string) => string;
export declare const warning: (text: string) => string;
export declare const error: (text: string) => string;
export declare const info: (text: string) => string;
export declare const muted: (text: string) => string;
export declare const cyan: (text: string) => string;
export declare const green: (text: string) => string;
export declare const yellow: (text: string) => string;
export declare const red: (text: string) => string;
export declare const blue: (text: string) => string;
export declare const gray: (text: string) => string;
export declare function gradientTeen(text: string): string;
export declare function gradientRainbow(text: string): string;
export declare function gradientCool(text: string): string;
export declare function gradientPassion(text: string): string;
export declare const header: (text: string) => string;
export declare const section: (text: string) => string;
export declare const subsection: (text: string) => string;
export declare const checkmark: (text?: string) => string;
export declare const crossmark: (text?: string) => string;
export declare const bullet: (text: string) => string;
export declare const numbered: (num: number, text: string) => string;
export declare const arrow: (text: string) => string;
export declare const rightArrow: (from: string, to: string) => string;
export declare function progressBar(current: number, total: number, width?: number): string;
export declare function printSeparator(char?: string, length?: number): string;
export declare function clearLine(): void;
export declare function cursorHide(): void;
export declare function cursorShow(): void;
//# sourceMappingURL=colors.d.ts.map