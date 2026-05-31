/**
 * Template info command - shows detailed information about templates
 */

import { printSection, printKeyValue } from '../../ui/output.js';
import { gradientTeen, bold, primary, muted } from '../../ui/colors.js';
import { getTemplateMetadata, getAllTemplates, getTemplatePreview } from '../../templates/index.js';
import { GRADLE_VERSIONS, TEMPLATE_CONFIGS } from '../../core/config.js';
import pc from 'picocolors';
import type { TemplateType, TemplateMetadata } from '../../core/types.js';

interface InfoCommandOptions {
  template?: string;
  json: boolean;
}

/**
 * Show detailed info about a template
 */
export async function createInfoCommand(
  template?: string,
  options: InfoCommandOptions = { json: false }
): Promise<void> {
  if (options.json) {
    if (template) {
      const meta = getTemplateMetadata(template as TemplateType);
      if (!meta) {
        console.log(JSON.stringify({ error: `Template "${template}" not found` }, null, 2));
        return;
      }
      printInfoJson(meta);
    } else {
      // Show info for all templates
      const templates = getAllTemplates();
      console.log(JSON.stringify(templates, null, 2));
    }
    return;
  }

  if (template) {
    await showTemplateInfo(template as TemplateType);
  } else {
    // Show brief info for all templates
    console.log('');
    console.log(gradientTeen('Available Templates'));
    console.log('');

    const templates = getAllTemplates();
    const maxNameLength = Math.max(...templates.map(t => t.name.length));
    const maxIdLength = Math.max(...templates.map(t => t.id.length));

    templates.forEach((t, index) => {
      const paddedName = t.name.padEnd(maxNameLength);
      const paddedId = t.id.padEnd(maxIdLength);

      console.log(`  ${primary(`${index + 1}.`)} ${bold(paddedName)} ${muted(`(${paddedId})`)}`);
      console.log(`     ${t.description}`);
      console.log('');
    });

    console.log('Usage: andrud info <template-name>');
    console.log('Example: andrud info kotlin-compose');
  }
}

/**
 * Show detailed info for a specific template
 */
async function showTemplateInfo(templateId: TemplateType): Promise<void> {
  const meta = getTemplateMetadata(templateId);
  if (!meta) {
    console.log(pc.red(`Template "${templateId}" not found.`));
    console.log('Available templates:');
    getAllTemplates().forEach(t => console.log(`  - ${t.id}`));
    return;
  }

  // Get template config for version info
  const config = TEMPLATE_CONFIGS[templateId];
  if (!config) {
    console.log(pc.red(`Template configuration not found for "${templateId}".`));
    return;
  }
  const isCompose = templateId === 'kotlin-compose';

  console.log('');
  console.log(gradientTeen(`═══ ${meta.name} ═══`));
  console.log('');
  console.log(bold(meta.description));
  console.log('');

  // Key information
  printSection('Configuration');
  printKeyValue([
    { key: 'Template ID', value: meta.id },
    { key: 'Language', value: config.language === 'kotlin' ? pc.green('Kotlin') : pc.yellow('Java') },
    { key: 'UI Framework', value: isCompose ? pc.cyan('Jetpack Compose') : pc.gray('XML Layouts') },
    { key: 'Min SDK', value: `API ${config.minSdk}` },
    { key: 'Target SDK', value: `API ${config.targetSdk}` },
    { key: 'Compile SDK', value: `API ${config.compileSdk}` }
  ]);

  // Version information
  printSection('Versions');
  printKeyValue([
    { key: 'Gradle', value: config.gradleVersion },
    { key: 'Android Gradle Plugin', value: config.agpVersion },
    { key: 'Kotlin', value: config.kotlinVersion || 'N/A' },
    ...(isCompose ? [
      { key: 'Compose BOM', value: GRADLE_VERSIONS.COMPOSE_BOM },
      { key: 'Compose Compiler', value: GRADLE_VERSIONS.COMPOSE_COMPILER }
    ] : []),
    ...(templateId === 'native-cpp' ? [
      { key: 'NDK', value: config.ndkVersion || GRADLE_VERSIONS.NDK }
    ] : [])
  ]);

  // Features
  printSection('Features');
  meta.features.forEach((feature, i) => {
    console.log(`  ${pc.green('+')} ${feature}`);
  });

  // Keywords
  printSection('Keywords');
  console.log(`  ${meta.keywords.map(k => pc.cyan(k)).join(', ')}`);

  // Code preview
  const preview = getTemplatePreview(templateId);
  if (preview) {
    printSection('Code Preview');
    console.log(pc.gray('─'.repeat(60)));
    console.log(pc.dim(preview.split('\n').slice(0, 15).join('\n')));
    if (preview.split('\n').length > 15) {
      console.log(pc.gray('...'));
    }
  }

  console.log('');
}

/**
 * Print template info as JSON
 */
function printInfoJson(meta: TemplateMetadata): void {
  const config = TEMPLATE_CONFIGS[meta.id];
  if (!config) return;

  const isCompose = meta.id === 'kotlin-compose';

  const info = {
    id: meta.id,
    name: meta.name,
    description: meta.description,
    language: config.language,
    uiFramework: config.uiFramework === 'compose' ? 'Jetpack Compose' : 'XML Layouts',
    keywords: meta.keywords,
    features: meta.features,
    versions: {
      gradle: config.gradleVersion,
      agp: config.agpVersion,
      kotlin: config.kotlinVersion || null,
      compose: config.composeEnabled ? {
        bom: GRADLE_VERSIONS.COMPOSE_BOM,
        compiler: GRADLE_VERSIONS.COMPOSE_COMPILER
      } : null,
      ndk: config.ndkVersion || null
    },
    sdk: {
      min: config.minSdk,
      target: config.targetSdk,
      compile: config.compileSdk
    },
    codePreview: getTemplatePreview(meta.id)
  };

  console.log(JSON.stringify(info, null, 2));
}