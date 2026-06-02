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
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get version from package.json
function getVersion(): string {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pkgPath = join(__dirname, '../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

const version = getVersion();
const cli = cac('andrud');

cli.version(version);

// Clean minimal help
function printHelp(): void {
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
  .option('-d, --directory <path>', 'Project directory')
  .option('--min-sdk <level>', 'Minimum Android SDK level')
  .option('--target-sdk <level>', 'Target Android SDK level')
  .option('--skip-install', 'Skip dependency installation')
  .option('--no-git', 'Skip .gitignore generation')
  .option('--no-readme', 'Skip README generation')
  .option('-y, --yes', 'Use defaults for non-specified prompts')
  .option('-f, --force', 'Overwrite')
  .example('andrud new MyApp -t kotlin-compose')
  .action(createNewCommand);

cli
  .command('init', 'Initialize in current directory')
  .alias('i')
  .option('-t, --template <type>', 'Template type')
  .option('-p, --package <name>', 'Package name')
  .option('-y, --yes', 'Use defaults for non-specified prompts')
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
      console.log(`  Options:`);
      console.log(`    ${pc.gray('--skip')}     Skip this update`);
      console.log(`    ${pc.gray('--never')}   Never remind again`);
    } else {
      console.log(`  ${pc.green('You are on the latest version:')} ${version}`);
    }
  });

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

export function runCli(): void {
  try {
    const args = process.argv.slice(2);

    // Show help
    if (args.includes('--help') || args.includes('-h')) {
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
      checkForUpdates();
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

// Note: runCli() is called from bin/andrud.js
