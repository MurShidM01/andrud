/**
 * Output formatting utilities
 */
import pc from 'picocolors';
import { bold, dim, section, printSeparator } from './colors.js';
import gradient from 'gradient-string';
const logger = {
    log: (message, ...args) => {
        console.log(message, ...args);
    },
    info: (message, ...args) => {
        console.log(pc.blue('INFO: ') + message, ...args);
    },
    success: (message, ...args) => {
        console.log(pc.green('SUCCESS: ') + message, ...args);
    },
    warn: (message, ...args) => {
        console.log(pc.yellow('WARN: ') + message, ...args);
    },
    error: (message, ...args) => {
        console.error(pc.red('ERROR: ') + message, ...args);
    },
    debug: (message, ...args) => {
        if (process.env.DEBUG || process.env.VERBOSE) {
            console.log(pc.gray('DEBUG: ') + message, ...args);
        }
    },
    verbose: (message, ...args) => {
        if (process.env.VERBOSE) {
            console.log(pc.gray('VERBOSE: ') + message, ...args);
        }
    }
};
export { logger };
/**
 * Creates a gradient from cyan to green (singleton pattern to prevent memory leak)
 */
const teenGradient = gradient('#00C9FF', '#92FE9D');
/**
 * Prints the welcome banner
 */
export function printWelcome() {
    console.log('');
    console.log(pc.cyan(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║     ██╗    ██╗ █████╗ ██████╗     ███████╗███╗   ██╗      ║
    ║     ██║    ██║██╔══██╗██╔══██╗    ██╔════╝████╗  ██║      ║
    ║     ██║ █╗ ██║███████║██████╔╝    █████╗  ██╔██╗ ██║      ║
    ║     ██║███╗██║██╔══██║██╔══██╗    ██╔══╝  ██║╚██╗██║      ║
    ║     ╚███╔███╔╝██║  ██║██║  ██║    ███████╗██║ ╚████║      ║
    ║      ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═══╝      ║
    ║                                                           ║
    ║     Android Project Generator v1.0.5                      ║
    ║     Modern Android Development CLI                         ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
  `));
    console.log('');
}
/**
 * Prints the goodbye message
 */
export function printGoodbye(success = true) {
    // Uses module-level teenGradient constant
    if (success) {
        console.log('');
        console.log(teenGradient(`
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      Thanks for using andrud! Happy coding! 🚀

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `));
    }
    else {
        console.log('');
        console.log(pc.red(`
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      Operation failed. Please check the error above.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `));
    }
}
/**
 * Prints a success message
 */
export function printSuccess(message, details) {
    console.log(pc.green('  ✓ ') + pc.white(message));
    if (details) {
        console.log(pc.gray(`    ${details}`));
    }
}
/**
 * Prints an error message
 */
export function printError(message, details) {
    console.error(pc.red('  ✗ ') + pc.white(message));
    if (details) {
        console.error(pc.gray(`    ${details}`));
    }
}
/**
 * Prints a section header
 */
export function printSection(text) {
    console.log('');
    console.log(section(text));
    console.log(dim(printSeparator('─', 50)));
}
/**
 * Prints key-value pairs
 */
export function printKeyValue(items) {
    const maxKeyLength = Math.max(...items.map(item => item.key.length));
    items.forEach(item => {
        const padding = ' '.repeat(maxKeyLength - item.key.length);
        console.log(`  ${pc.cyan(item.key)}${padding}   ${item.value}`);
    });
}
/**
 * Prints a separator line
 */
export function printSeparatorLine(char = '─', length = 60) {
    console.log(dim(char.repeat(length)));
}
/**
 * Prints a banner with text
 */
export function printBanner(text, color = 'primary') {
    const padding = 4;
    const line = ' '.repeat(padding);
    const border = '━'.repeat(text.length + padding * 2);
    console.log('');
    console.log(pc.cyan('  ' + border));
    console.log(pc.cyan('  ║') + ' '.repeat(padding) + text + ' '.repeat(padding) + pc.cyan('║'));
    console.log(pc.cyan('  ' + border));
    console.log('');
}
/**
 * Prints an ASCII box with content
 */
export function printAsciiBox(lines, options = {}) {
    const border = options.border ?? '─';
    const padding = options.padding ?? 2;
    const maxLength = Math.max(...lines.map(l => l.length));
    const width = maxLength + padding * 2;
    console.log(pc.gray('  ┌' + border.repeat(width) + '┐'));
    if (lines.length === 0) {
        console.log(pc.gray('  │' + ' '.repeat(width) + '│'));
    }
    else {
        lines.forEach(line => {
            const padded = line + ' '.repeat(maxLength - line.length);
            console.log(pc.gray('  │') + ' '.repeat(padding) + padded + ' '.repeat(padding) + pc.gray('│'));
        });
    }
    console.log(pc.gray('  └' + border.repeat(width) + '┘'));
}
/**
 * Prints a table with columns
 */
export function printTable(columns, rows) {
    const colWidths = columns.map(col => {
        const headerWidth = col.header.length;
        const dataWidths = rows.map(row => col.accessor(row).length);
        return col.width ?? Math.max(headerWidth, ...dataWidths);
    });
    // Print header
    const headerRow = columns.map((_col, i) => {
        const width = colWidths[i] ?? 10;
        return _col.header.substring(0, width).padEnd(width);
    });
    console.log(bold(headerRow.join('   ')));
    console.log(pc.gray(colWidths.map(w => '─'.repeat(w)).join('   ')));
    // Print rows
    rows.forEach(row => {
        const dataRow = columns.map((col, i) => {
            const width = colWidths[i] ?? 10;
            const value = col.accessor(row);
            return value.substring(0, width).padEnd(width);
        });
        console.log(dataRow.join('   '));
    });
}
/**
 * Prints numbered steps
 */
export function printSteps(steps) {
    console.log('');
    steps.forEach((step, index) => {
        const num = pc.cyan(`${index + 1}.`);
        console.log(`  ${num} ${step}`);
    });
    console.log('');
}
//# sourceMappingURL=output.js.map