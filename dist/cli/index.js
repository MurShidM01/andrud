/**
 * Command registration and main CLI entry point
 */
import { cac } from 'cac';
import pc from 'picocolors';
import { createCommand } from './commands/create.js';
import { createNewCommand } from './commands/new.js';
import { createInitCommand } from './commands/init.js';
import { createInfoCommand } from './commands/info.js';
import { createListCommand } from './commands/list.js';
const pkg = { version: '1.0.0' };
const cli = cac('andrud');
cli.version(pkg.version);
// Clean minimal help
function printHelp() {
    console.log('');
    console.log(`  ${pc.cyan('andrud')} - Android Project Scaffolding`);
    console.log('');
    console.log(`  ${pc.gray('andrud create')}              Create a new project`);
    console.log(`  ${pc.gray('andrud list')}                 Show available templates`);
    console.log(`  ${pc.gray('andrud info <template>')}      View template details`);
    console.log('');
    console.log(`  ${pc.gray('andrud create MyApp')}         Create with name`);
    console.log('');
}
// Commands
cli
    .command('create', 'Create a new Android project')
    .alias('c')
    .option('-f, --force', 'Overwrite existing files')
    .example('andrud create')
    .example('andrud create --force')
    .action(createCommand);
cli
    .command('new [name]', 'Create a new project')
    .alias('n')
    .option('-t, --template <type>', 'Template type')
    .option('-p, --package <name>', 'Package name')
    .option('-f, --force', 'Overwrite')
    .example('andrud new MyApp -t kotlin-compose')
    .action(createNewCommand);
cli
    .command('init', 'Initialize in current directory')
    .alias('i')
    .option('-f, --force', 'Overwrite')
    .example('andrud init')
    .action(createInitCommand);
cli
    .command('info [template]', 'Show template info')
    .example('andrud info kotlin-compose')
    .action(createInfoCommand);
cli
    .command('list', 'List all templates')
    .alias('ls')
    .option('--json', 'Output as JSON')
    .action(createListCommand);
cli.on('command:!', () => {
    console.error(pc.red(`  Unknown command. See ${pc.cyan('--help')}\n`));
});
process.on('uncaughtException', (error) => {
    console.error(pc.red(`  ${error.message}\n`));
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error(pc.red(`  ${reason}\n`));
    process.exit(1);
});
export function runCli() {
    try {
        const args = process.argv.slice(2);
        // Show help
        if (args.includes('--help') || args.includes('-h')) {
            printHelp();
            return;
        }
        // Show version
        if (args.includes('--version') || args.includes('-V')) {
            console.log(pkg.version);
            return;
        }
        // Quick help on no args
        if (args.length === 0) {
            console.log('');
            console.log(`  ${pc.cyan('andrud')} - Create Android projects`);
            console.log('');
            console.log(`  ${pc.gray('andrud create')}     Start interactive setup`);
            console.log(`  ${pc.gray('andrud --help')}     Show all commands`);
            console.log('');
            return;
        }
        cli.parse(process.argv, { run: true });
    }
    catch (error) {
        console.error(pc.red(`  ${error.message}\n`));
        process.exit(1);
    }
}
// Note: runCli() is called from bin/andrud.js
//# sourceMappingURL=index.js.map