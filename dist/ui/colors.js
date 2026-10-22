/**
 * Color and text formatting utilities using picocolors and gradient-string
 */
import pc from 'picocolors';
import gradient from 'gradient-string';
// Pre-initialized singleton gradient instances
const teenGradientInstance = gradient('#00C9FF', '#92FE9D');
const coolGradientInstance = gradient('#667eea', '#764ba2');
const passionGradientInstance = gradient('#ee0979', '#ff6a00');
// Style function to apply color based on type
export function style(text, type) {
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
export const bold = (text) => pc.bold(text);
export const dim = (text) => pc.dim(text);
export const underline = (text) => pc.underline(text);
export const inverse = (text) => pc.inverse(text);
export const italic = (text) => pc.italic(text);
// Color functions
export const primary = (text) => pc.cyan(text);
export const success = (text) => pc.green(text);
export const warning = (text) => pc.yellow(text);
export const error = (text) => pc.red(text);
export const info = (text) => pc.blue(text);
export const muted = (text) => pc.gray(text);
// Aliases for backward compatibility
export const cyan = (text) => pc.cyan(text);
export const green = (text) => pc.green(text);
export const yellow = (text) => pc.yellow(text);
export const red = (text) => pc.red(text);
export const blue = (text) => pc.blue(text);
export const gray = (text) => pc.gray(text);
// Gradient functions using gradient-string
export function gradientTeen(text) {
    return teenGradientInstance(text);
}
export function gradientRainbow(text) {
    return gradient.rainbow(text);
}
export function gradientCool(text) {
    return coolGradientInstance(text);
}
export function gradientPassion(text) {
    return passionGradientInstance(text);
}
// Section formatting
export const header = (text) => {
    return pc.bold(pc.cyan(`\n${text}\n`));
};
export const section = (text) => {
    return pc.bold(pc.white(text));
};
export const subsection = (text) => {
    return pc.dim(text);
};
// Symbol functions for visual elements
export const checkmark = (text) => {
    const symbol = pc.green('✓');
    return text ? `${symbol} ${text}` : symbol;
};
export const crossmark = (text) => {
    const symbol = pc.red('✗');
    return text ? `${symbol} ${text}` : symbol;
};
// Arrow and bullet functions
export const bullet = (text) => {
    return `${pc.gray('•')} ${text}`;
};
export const numbered = (num, text) => {
    return `${pc.gray(`${num}.`)} ${text}`;
};
export const arrow = (text) => {
    return `${pc.gray('→')} ${text}`;
};
export const rightArrow = (from, to) => {
    return `${from} ${pc.gray('→')} ${to}`;
};
// Progress bar
export function progressBar(current, total, width = 20) {
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
export function printSeparator(char = '─', length = 60) {
    return pc.gray(char.repeat(Math.max(0, length)));
}
// Terminal control functions
export function clearLine() {
    process.stdout.write('\r\x1B[K');
}
export function cursorHide() {
    process.stdout.write('\x1B[?25l');
}
export function cursorShow() {
    process.stdout.write('\x1B[?25h');
}
//# sourceMappingURL=colors.js.map