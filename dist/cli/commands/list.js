/**
 * List templates command - shows all available templates
 */
import { gradientTeen, bold, primary, muted } from '../../ui/colors.js';
import { printSection } from '../../ui/output.js';
import { getAllTemplates, getTemplatePreview, searchTemplates } from '../../templates/index.js';
import { TEMPLATE_CONFIGS } from '../../core/config.js';
import pc from 'picocolors';
/**
 * List all available templates
 */
export async function createListCommand(options = { json: false }) {
    // Validate search input
    if (options.search && typeof options.search !== 'string') {
        console.log(pc.red('Error: Search query must be a string'));
        return;
    }
    if (options.search && options.search.length > 100) {
        console.log(pc.red('Error: Search query is too long (maximum 100 characters)'));
        return;
    }
    // Filter templates based on search
    const templates = options.search?.trim()
        ? searchTemplates(options.search.trim())
        : getAllTemplates();
    if (options.json) {
        const templateList = templates.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            language: TEMPLATE_CONFIGS[t.id]?.language === 'kotlin' ? 'Kotlin' : 'Java',
            uiFramework: TEMPLATE_CONFIGS[t.id]?.uiFramework === 'compose' ? 'Compose' : 'XML'
        }));
        console.log(JSON.stringify(templateList, null, 2));
        return;
    }
    if (templates.length === 0) {
        console.log(pc.yellow('No templates found.'));
        return;
    }
    console.log('');
    console.log(gradientTeen('╔══════════════════════════════════════════════════════════════╗'));
    console.log(gradientTeen('║                    Android Project Templates                   ║'));
    console.log(gradientTeen('╚══════════════════════════════════════════════════════════════╝'));
    console.log('');
    templates.forEach((template, index) => {
        printTemplateCard(template, index + 1);
    });
    // Summary
    printSection('Summary');
    console.log(`  Total templates: ${bold(templates.length.toString())}`);
    console.log(`  Kotlin templates: ${bold(templates.filter(t => TEMPLATE_CONFIGS[t.id]?.language === 'kotlin').length.toString())}`);
    console.log(`  Java templates: ${bold(templates.filter(t => TEMPLATE_CONFIGS[t.id]?.language === 'java').length.toString())}`);
    console.log(`  Compose templates: ${bold(templates.filter(t => TEMPLATE_CONFIGS[t.id]?.uiFramework === 'compose').length.toString())}`);
    console.log('');
    console.log(muted('  Use ') + primary('andrud info <template>') + muted(' for more details'));
    console.log('');
}
/**
 * Print a template as a card
 */
function printTemplateCard(template, number) {
    const config = TEMPLATE_CONFIGS[template.id];
    if (!config)
        return;
    const isKotlin = config.language === 'kotlin';
    const isCompose = config.uiFramework === 'compose';
    // Template header
    console.log(primary(`  ${number}. `) + bold(template.name));
    console.log(`    ${template.description}`);
    console.log('');
    // Tags
    const tags = [];
    tags.push(isKotlin ? pc.green('Kotlin') : pc.yellow('Java'));
    tags.push(isCompose ? pc.cyan('Compose') : pc.gray('XML'));
    if (template.id === 'native-cpp') {
        tags.push(pc.magenta('NDK'));
    }
    console.log(`    ${tags.join('  ')}`);
    // Key features
    const features = template.features.slice(0, 3);
    console.log(`    ${muted('Features:')} ${features.join(pc.gray(', '))}`);
    // Version info
    console.log(`    ${muted('Gradle:')} ${config.gradleVersion}  ${muted('AGP:')} ${config.agpVersion}`);
    // Command example
    console.log('');
    console.log(`    ${muted('Run:')} ${primary(`andrud new MyApp -t ${template.id}`)}`);
    // Code preview snippet
    const preview = getTemplatePreview(template.id);
    if (preview) {
        const lines = preview.split('\n').slice(0, 4);
        console.log('');
        console.log('    ' + pc.gray('┌─ Code preview'));
        lines.forEach((line, i) => {
            const isLast = i === lines.length - 1;
            const prefix = isLast ? '    ' : '    ';
            const linePrefix = isLast ? '└─' : '│ ';
            console.log(prefix + pc.gray(linePrefix) + pc.dim(line.substring(0, 50) + (line.length > 50 ? '...' : '')));
        });
    }
    console.log('');
    console.log(pc.gray('    ' + '─'.repeat(60)));
    console.log('');
}
/**
 * Print templates as a compact list
 */
export function printTemplateList(templates) {
    const maxIdLength = Math.max(...templates.map(t => t.id.length));
    const maxNameLength = Math.max(...templates.map(t => t.name.length));
    templates.forEach((t, i) => {
        const config = TEMPLATE_CONFIGS[t.id];
        if (!config)
            return;
        const id = t.id.padEnd(maxIdLength);
        const name = t.name.padEnd(maxNameLength);
        const lang = config.language === 'kotlin' ? pc.green('K') : pc.yellow('J');
        const ui = config.uiFramework === 'compose' ? pc.cyan('C') : pc.gray('X');
        console.log(`  ${primary(String(i + 1).padStart(2))} ${bold(id)}  ${name}  ${lang}${ui}  ${muted(t.description.substring(0, 40))}`);
    });
}
//# sourceMappingURL=list.js.map