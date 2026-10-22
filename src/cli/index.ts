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
import { createKmpCommand } from './commands/kmp.js';
import { getPackageVersion } from '../utils/version.js';

const version = getPackageVersion();
const cli = cac('andrud');

cli.version(version);

// Clean minimal help
function printHelp(): void {
  console.log('');
  console.log(`  ${pc.cyan('andrud')} - Android & Kotlin Multiplatform Project Scaffolding`);
  console.log('');
  console.log(`  ${pc.bold('Commands:')}`);
  console.log(`  ${pc.gray('andrud create [name]')}        Create a new project interactively`);
  console.log(`  ${pc.gray('andrud new [name]')}           Create a project with full options`);
  console.log(`  ${pc.gray('andrud kmp [name]')}           Create a cross-platform Kotlin Multiplatform project`);
  console.log(`  ${pc.gray('andrud init')}                 Initialize a project in current directory`);
  console.log(`  ${pc.gray('andrud list')}                 Show available templates`);
  console.log(`  ${pc.gray('andrud info <template>')}      View template details`);
  console.log(`  ${pc.gray('andrud update')}               Check for CLI updates`);
  console.log('');
  console.log(`  ${pc.bold('Examples:')}`);
  console.log(`  ${pc.gray('andrud create MyApp')}         Create with name`);
  console.log(`  ${pc.gray('andrud kmp MyKmpApp --platforms android,ios,desktop,wasmJs')}`);
  console.log(`  ${pc.gray('andrud new MyApp -t kotlin-multiplatform -p com.example.myapp')}`);
  console.log('');
}

// Commands
cli
  .command('create [name]', 'Create a new Android or Kotlin Multiplatform project')
  .alias('c')
  .option(
    '-t, --template <type>',
    'Template type (kotlin-compose, kotlin-xml, java-xml, native-cpp, kotlin-multiplatform)'
  )
  .option('-p, --package <name>', 'Package name')
  .option('-d, --directory <path>', 'Parent project directory')
  .option('--platforms <targets>', 'Kotlin Multiplatform targets (android,ios,desktop,wasmJs)')
  .option('-y, --yes', 'Use defaults for non-specified prompts')
  .option('-f, --force', 'Overwrite existing files')
  .example('andrud create')
  .example('andrud create MyApp --force')
  .action(createCommand);

cli
  .command('new [name]', 'Create a new project')
  .alias('n')
  .option(
    '-t, --template <type>',
    'Template type (kotlin-compose, kotlin-xml, java-xml, native-cpp, kotlin-multiplatform)'
  )
  .option('-p, --package <name>', 'Package name')
  .option('-d, --directory <path>', 'Project directory')
  .option('--platforms <targets>', 'Kotlin Multiplatform targets (android,ios,desktop,wasmJs)')
  .option('--min-sdk <level>', 'Minimum Android SDK level')
  .option('--target-sdk <level>', 'Target Android SDK level')
  .option('--skip-install', 'Skip dependency installation')
  .option('--no-git', 'Skip .gitignore generation')
  .option('--no-readme', 'Skip README generation')
  .option('-y, --yes', 'Use defaults for non-specified prompts')
  .option('-f, --force', 'Overwrite existing files')
  .option('-v, --verbose', 'Enable verbose output')
  .example('andrud new MyApp -t kotlin-compose')
  .example('andrud new MyKmpApp -t kotlin-multiplatform --platforms android,ios,desktop,wasmJs')
  .action(createNewCommand);

cli
  .command('kmp [name]', 'Create a cross-platform Kotlin Multiplatform project')
  .option('-p, --package <name>', 'Package name')
  .option('-d, --directory <path>', 'Parent project directory')
  .option('--platforms <targets>', 'Target platforms (android,ios,desktop,wasmJs)')
  .option('--min-sdk <level>', 'Minimum Android SDK level (default: 24)')
  .option('--target-sdk <level>', 'Target Android SDK level (default: 37)')
  .option('-y, --yes', 'Use defaults for non-specified prompts')
  .option('-f, --force', 'Overwrite existing files')
  .example('andrud kmp MyKmpApp')
  .example('andrud kmp MyKmpApp --platforms android,ios,desktop,wasmJs')
  .action(createKmpCommand);

cli
  .command('init', 'Initialize in current directory')
  .alias('i')
  .option('-t, --template <type>', 'Template type')
  .option('-p, --package <name>', 'Package name')
  .option('--platforms <targets>', 'Kotlin Multiplatform targets (android,ios,desktop,wasmJs)')
  .option('-y, --yes', 'Use defaults for non-specified prompts')
  .option('-f, --force', 'Overwrite existing files')
  .example('andrud init')
  .action(createInitCommand);

cli
  .command('info [template]', 'Show template info')
  .option('--json', 'Output as JSON')
  .example('andrud info kotlin-multiplatform')
  .action(createInfoCommand);

cli
  .command('list', 'List all templates')
  .alias('ls')
  .option('--json', 'Output as JSON')
  .option('-s, --search <query>', 'Search templates by keyword')
  .action(createListCommand);

cli
  .command('update', 'Check for updates')
  .action(async () => {
    const updateNotifier = await import('update-notifier');
    const pkg = { name: 'andrud', version };
    const notifier = updateNotifier.default({ pkg });

    if (notifier.update) {
      console.log(`  ${pc.yellow('Update available:')} ${pc.cyan(notifier.update.latest)}`);
      console.log(`  ${pc.gray('Current:')} ${version}`);
      console.log('');
      console.log(`  Run ${pc.cyan('npm install -g andrud')} to update`);
      console.log('');
    } else {
      console.log(`  ${pc.green('You are on the latest version:')} ${version}`);
    }
  });

cli.on('command:!', () => {
  console.error(pc.red(`  Unknown command. See ${pc.cyan('--help')}\n`));
  process.exitCode = 1;
});

process.on('uncaughtException', (error) => {
  console.error(pc.red(`  ${error.message}\n`));
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(pc.red(`  ${reason}\n`));
  process.exit(1);
});

cli.help();

export async function runCli(argv: string[] = process.argv): Promise<void> {
  try {
    const args = argv.slice(2);

    // Show clean root help if --help / -h is passed without a subcommand
    const nonFlagArgs = args.filter((arg) => !arg.startsWith('-'));
    if ((args.includes('--help') || args.includes('-h')) && nonFlagArgs.length === 0) {
      printHelp();
      return;
    }

    // Show version
    if (args.includes('--version') || args.includes('-V')) {
      console.log(version);
      return;
    }

    // Check for updates in background (non-blocking)
    if (!args.includes('update')) {
      void checkForUpdates();
    }

    // Quick help on no args
    if (args.length === 0) {
      console.log('');
      console.log(`  ${pc.cyan('andrud')} - Create Android & Kotlin Multiplatform projects`);
      console.log('');
      console.log(`  ${pc.gray('andrud create')}     Start interactive setup`);
      console.log(`  ${pc.gray('andrud kmp')}        Create a cross-platform Kotlin Multiplatform app`);
      console.log(`  ${pc.gray('andrud --help')}     Show all commands`);
      console.log('');
      return;
    }

    cli.parse(argv, { run: false });
    await cli.runMatchedCommand();
  } catch (error) {
    console.error(pc.red(`  ${(error as Error).message}\n`));
    process.exit(1);
  }
}

// Check for updates (non-blocking)
async function checkForUpdates(): Promise<void> {
  try {
    const updateNotifier = await import('update-notifier');
    const pkg = { name: 'andrud', version };
    const notifier = updateNotifier.default({ pkg });

    notifier.notify({
      defer: true,
      isGlobal: true,
      updateConfig: {
        behavior: 'default',
        excludePrerelease: true
      }
    });
  } catch {
    // Silently fail - don't interrupt user
  }
}
