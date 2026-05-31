#!/usr/bin/env node

/**
 * @andrud/cli - Android Project Scaffolding CLI
 *
 * Entry point for the andrud CLI tool.
 * This file is used when running via `node bin/andrud.js`
 */

// Run the CLI
import('../dist/cli/index.js').then((module) => {
  if (module.runCli) {
    Promise.resolve(module.runCli()).catch((error) => {
      console.error('CLI execution failed:', error);
      process.exit(1);
    });
  } else {
    console.error('Failed to load CLI: runCli function not found');
    process.exit(1);
  }
}).catch((error) => {
  console.error('Failed to start CLI:', error);
  process.exit(1);
});