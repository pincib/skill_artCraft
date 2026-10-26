#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const packageRoot = path.resolve(__dirname, '..');
const skillsSource = path.join(packageRoot, '.agents', 'skills');
const pluginSource = path.join(packageRoot, '.agents', 'plugins', 'artcraft-suite');
const skillNames = fs.existsSync(skillsSource)
  ? fs.readdirSync(skillsSource).filter((name) => fs.statSync(path.join(skillsSource, name)).isDirectory()).sort()
  : [];

const apps = [
  { id: 'effectcraft', app: 'EffectCraft', executable: 'effectcraft-cli', args: ['mcp', '--automation-read-root', '.', '--automation-write-root', '.'] },
  { id: 'filmcraft', app: 'FilmCraft', executable: 'filmcraft-cli', args: ['mcp'], confined: false },
  { id: 'lightcraft', app: 'LightCraft', executable: 'lightcraft-cli', args: ['mcp', '--compact'], confined: false },
  { id: 'photocraft', app: 'PhotoCraft', executable: 'photocraft-cli', args: ['mcp', '--automation-read-root', '.', '--automation-write-root', '.'] },
  { id: 'vectorcraft', app: 'VectorCraft', executable: 'vectorcraft-cli', args: ['mcp', '--headless', '--automation-read-root', '.', '--automation-write-root', '.'] },
  { id: 'deckcraft', app: 'DeckCraft', executable: 'deckcraft-cli', args: ['mcp', '--automation-read-root', '.', '--automation-write-root', '.'] },
  { id: 'designcraft', app: 'DesignCraft', executable: 'designcraft-cli', args: ['mcp', '--automation-read-root', '.', '--automation-write-root', '.'] },
  { id: 'pdfcraft', app: 'PdfCraft', executable: 'pdfcraft-cli', args: ['mcp', '--compact', '--automation-read-root', '.', '--automation-write-root', '.'] },
  { id: 'figcraft', app: 'FigCraft', executable: 'figcraft-cli', args: ['mcp', '--automation-read-root', '.', '--automation-write-root', '.'] },
];
const booleanFlags = new Set([
  '--local', '--global', '--all', '--antigravity', '--codex', '--allow-unconfined',
  '--update', '--uninstall', '--version', '--help',
]);

function usage() {
  console.log(`ArtCraft Agent Skills installer

Usage:
  npx github:pincib/skill_artCraft [--local | --global] [--antigravity] [--codex]
  npx github:pincib/skill_artCraft --update [--local | --global] [--antigravity] [--codex]
  npx github:pincib/skill_artCraft --uninstall [--local | --global] [--antigravity] [--codex]

Targets:
  --local          Install in the selected workspace. Without an app flag, installs skills to .agents/skills.
  --global, --all  Install globally. With no app flag, installs for Antigravity and Codex.
  --antigravity    Install an Antigravity plugin under .gemini/config/plugins (or the local plugin directory).
  --codex          Install Codex skills and register the MCP plugin in a local marketplace.
  --workspace DIR  Workspace for installs and MCP read roots (default: current directory).
  --home DIR       Home directory for a global install (default: OS home directory).
  --app-dir DIR    Restrict app detection to these directories; may be repeated.
  --allow-unconfined Include detected apps without MCP file-root restrictions (FilmCraft, LightCraft).
  --update         Replace the selected ArtCraft skill/plugin files with this package version.
  --uninstall      Remove only the selected ArtCraft skill folders or plugin directory.
  --version        Print package version.
  --help           Show this help.

Detected, confined apps use --workspace for reads and its .tmp, renders and exports folders for writes. FilmCraft and
LightCraft are skipped unless --allow-unconfined is set because their MCP CLIs do not enforce those file roots.
After installing the Codex plugin, open the local ArtCraft marketplace in Codex and enable the plugin.`);
}

function parseArgs(argv) {
  const options = { flags: new Set(), values: {} };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--workspace' || arg === '--home' || arg === '--app-dir') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a directory path.`);
      if (arg === '--app-dir') {
        options.values.appDirs ||= [];
        options.values.appDirs.push(value);
      } else {
        options.values[arg.slice(2)] = value;
      }
      i += 1;
    } else if (arg.startsWith('--')) {
      if (!booleanFlags.has(arg)) throw new Error(`Unknown option: ${arg}`);
      options.flags.add(arg);
    } else if (arg === '-g') {
      options.flags.add('--global');
    } else if (arg === '-h') {
      options.flags.add('--help');
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

function removePath(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

function findOnPath(executable) {
  const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === 'path');
  const pathValue = pathKey ? process.env[pathKey] : '';
  const extensions = process.platform === 'win32' ? ['', '.exe', '.cmd', '.bat'] : [''];

  for (const directory of (pathValue || '').split(path.delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = path.resolve(directory, `${executable}${extension}`);
      try {
        if (!fs.statSync(candidate).isFile()) continue;
        if (process.platform !== 'win32') fs.accessSync(candidate, fs.constants.X_OK);
        return candidate;
      } catch {
        // Continue searching the remaining PATH entries.
      }
    }
  }
  return null;
}

function findAppExecutable(app, explicitAppDirs = []) {
  if (explicitAppDirs.length) {
    const extensions = process.platform === 'win32' ? ['', '.exe', '.cmd', '.bat'] : [''];
    for (const directory of explicitAppDirs) {
      for (const extension of extensions) {
        const candidate = path.resolve(directory, `${app.executable}${extension}`);
        try {
          if (!fs.statSync(candidate).isFile()) continue;
          if (process.platform !== 'win32') fs.accessSync(candidate, fs.constants.X_OK);
          return candidate;
        } catch {
          // Continue searching the explicitly supplied directories.
        }
      }
    }
    return null;
  }

  const candidates = [];
  if (process.platform === 'win32') {
    const programRoots = [process.env.ProgramFiles, process.env['ProgramFiles(x86)']].filter(Boolean);
    const localAppData = process.env.LOCALAPPDATA;
    for (const root of programRoots) candidates.push(path.join(root, app.app, `${app.executable}.exe`));
    if (localAppData) {
      candidates.push(path.join(localAppData, 'Programs', app.app, `${app.executable}.exe`));
      candidates.push(path.join(localAppData, 'ArtCraft', 'apps', app.id, `${app.executable}.exe`));
    }
  } else if (process.platform === 'darwin') {
    candidates.push(path.join(os.homedir(), 'Applications', `${app.app}.app`, 'Contents', 'MacOS', app.executable));
    candidates.push(path.join('/Applications', `${app.app}.app`, 'Contents', 'MacOS', app.executable));
  }

  for (const candidate of candidates) {
    try {
      if (!fs.statSync(candidate).isFile()) continue;
      if (process.platform !== 'win32') fs.accessSync(candidate, fs.constants.X_OK);
      return path.resolve(candidate);
    } catch {
      // The app is not in this conventional install location.
    }
  }
  return findOnPath(app.executable);
}

function detectServers(explicitAppDirs = [], allowUnconfined = false) {
  const found = [];
  const skipped = [];
  for (const app of apps) {
    const command = findAppExecutable(app, explicitAppDirs);
    if (!command) continue;
    const detected = { id: app.id, app: app.app, command, args: app.args, confined: app.confined !== false };
    if (!detected.confined && !allowUnconfined) skipped.push(detected);
    else found.push(detected);
  }
  return { found, skipped };
}

function configuredArguments(args, workspace) {
  const result = [];
  const writeRoots = ['.tmp', 'renders', 'exports'].map((directory) => path.join(workspace, directory));
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--automation-read-root') {
      result.push(argument, workspace);
      index += 1;
    } else if (argument === '--automation-write-root') {
      for (const root of writeRoots) result.push(argument, root);
      index += 1;
    } else {
      result.push(argument);
    }
  }
  return result;
}

function ensureWorkspaceMcpRoots(workspace, found) {
  if (!found.some((app) => app.args.includes('--automation-write-root'))) return;
  for (const directory of ['.tmp', 'renders', 'exports']) {
    const root = path.join(workspace, directory);
    try {
      const details = fs.lstatSync(root);
      if (details.isSymbolicLink() || !details.isDirectory()) {
        throw new Error(`MCP write root must be a real directory, not a link or file: ${root}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      fs.mkdirSync(root, { recursive: true });
    }
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function readMcpConfig(file) {
  if (!fs.existsSync(file)) return {};
  let existing;
  try {
    existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot preserve invalid MCP JSON at ${file}: ${error.message}`);
  }
  if (!existing || typeof existing !== 'object' || Array.isArray(existing)) {
    throw new Error(`MCP config must contain a JSON object: ${file}`);
  }
  if (existing.mcpServers !== undefined && (!existing.mcpServers || typeof existing.mcpServers !== 'object' || Array.isArray(existing.mcpServers))) {
    throw new Error(`MCP servers must be a JSON object: ${file}`);
  }
  return existing;
}

function mergeMcpConfig(previous, generated, portable = false) {
  return {
    ...previous,
    ...(portable ? { $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json' } : {}),
    mcpServers: { ...(previous.mcpServers || {}), ...generated },
  };
}

function codexServersFor(found, workspace) {
  const mcpServers = {};
  for (const app of found) {
    mcpServers[app.id] = {
      type: 'stdio',
      command: app.command,
      args: configuredArguments(app.args, workspace),
      cwd: workspace,
    };
  }
  return mcpServers;
}

function updateMarketplace(file, pluginPath, marketplaceRoot, uninstall = false) {
  if (uninstall && !fs.existsSync(file)) return;
  let marketplace = { name: 'artcraft-local-plugins', interface: { displayName: 'ArtCraft Local Plugins' }, plugins: [] };
  if (fs.existsSync(file)) {
    try {
      marketplace = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      throw new Error(`Cannot update invalid marketplace JSON at ${file}: ${error.message}`);
    }
    if (!marketplace || typeof marketplace !== 'object' || Array.isArray(marketplace)) {
      throw new Error(`Marketplace file must contain a JSON object: ${file}`);
    }
    if (marketplace.plugins !== undefined && !Array.isArray(marketplace.plugins)) {
      throw new Error(`Marketplace plugins must be an array: ${file}`);
    }
  }
  marketplace.plugins ||= [];
  marketplace.plugins = marketplace.plugins.filter((entry) => entry?.name !== 'artcraft-suite');
  if (!uninstall) {
    const relative = path.relative(marketplaceRoot, pluginPath).split(path.sep).join('/');
    marketplace.plugins.push({
      name: 'artcraft-suite',
      source: { source: 'local', path: relative.startsWith('./') ? relative : `./${relative}` },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
      category: 'Design',
    });
  }
  writeJson(file, marketplace);
}

function installSkills(target, update) {
  fs.mkdirSync(target, { recursive: true });
  for (const name of skillNames) {
    const destination = path.join(target, name);
    if (update) removePath(destination);
    copyDirectory(path.join(skillsSource, name), destination);
    console.log(`  ✓ ${name}`);
  }
}

function installPlugin(target, explicitAppDirs, workspace, includeBundledSkills, registerMarketplace, marketplaceRoot, allowUnconfined) {
  const previousAntigravity = readMcpConfig(path.join(target, 'mcp_config.json'));
  const previousCodex = readMcpConfig(path.join(target, 'mcp.json'));
  const { found, skipped } = detectServers(explicitAppDirs, allowUnconfined);
  ensureWorkspaceMcpRoots(workspace, found);
  copyDirectory(pluginSource, target);

  const pluginSkills = path.join(target, 'skills');
  for (const name of skillNames) removePath(path.join(pluginSkills, name));
  if (includeBundledSkills) {
    fs.mkdirSync(pluginSkills, { recursive: true });
    for (const name of skillNames) copyDirectory(path.join(skillsSource, name), path.join(pluginSkills, name));
  }

  const antigravityServers = Object.fromEntries(found.map((app) => [app.id, {
    command: app.command,
    args: configuredArguments(app.args, workspace),
  }]));
  writeJson(path.join(target, 'mcp_config.json'), mergeMcpConfig(previousAntigravity, antigravityServers));
  const codexServers = codexServersFor(found, workspace);
  writeJson(path.join(target, 'mcp.json'), mergeMcpConfig(previousCodex, codexServers, true));
  if (registerMarketplace) {
    updateMarketplace(path.join(marketplaceRoot, '.agents', 'plugins', 'marketplace.json'), target, marketplaceRoot);
  }
  return { found, skipped };
}

function selectTargets(options) {
  const flags = options.flags;
  const local = flags.has('--local');
  const global = flags.has('--global') || flags.has('--all');
  const wantsAntigravity = flags.has('--antigravity');
  const wantsCodex = flags.has('--codex');

  if (local && global) throw new Error('Choose either --local or --global, not both.');

  if (local) {
    if (!wantsAntigravity && !wantsCodex) return [{ kind: 'skills', scope: 'local' }];
    return [
      ...(wantsAntigravity ? [{ kind: 'plugin', scope: 'local' }] : []),
      ...(wantsCodex ? [{ kind: 'codexPlugin', scope: 'local' }, { kind: 'skills', scope: 'local' }] : []),
      ...(wantsAntigravity && !wantsCodex ? [{ kind: 'skills', scope: 'local' }] : []),
    ];
  }

  if (global || wantsAntigravity || wantsCodex) {
    const includeAntigravity = wantsAntigravity || (!wantsCodex && global);
    const includeCodex = wantsCodex || (!wantsAntigravity && global);
    return [
      ...(includeAntigravity ? [{ kind: 'plugin', scope: 'global' }] : []),
      ...(includeCodex ? [{ kind: 'codexPlugin', scope: 'global' }, { kind: 'skills', scope: 'global' }] : []),
    ];
  }

  return [{ kind: 'skills', scope: 'local' }];
}

function destinationFor(target, workspace, home) {
  if (target.kind === 'skills') {
    return path.join(target.scope === 'local' ? workspace : home, '.agents', 'skills');
  }
  if (target.kind === 'codexPlugin') {
    return target.scope === 'local'
      ? path.join(workspace, '.agents', 'plugins', 'artcraft-suite')
      : path.join(home, '.codex', 'plugins', 'artcraft-suite');
  }
  return target.scope === 'local'
    ? path.join(workspace, '.agents', 'plugins', 'artcraft-suite')
    : path.join(home, '.gemini', 'config', 'plugins', 'artcraft-suite');
}

function perform(options) {
  const flags = options.flags;
  if (flags.has('--help')) return usage();

  const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  if (flags.has('--version')) return console.log(pkg.version);
  if (flags.has('--update') && flags.has('--uninstall')) throw new Error('Choose either --update or --uninstall.');
  if (!skillNames.length || skillNames.some((name) => !fs.existsSync(path.join(skillsSource, name, 'SKILL.md')))) {
    throw new Error(`Skill sources are missing or incomplete in ${skillsSource}.`);
  }
  if (!fs.existsSync(path.join(pluginSource, 'plugin.json')) || !fs.existsSync(path.join(pluginSource, 'rules', 'AGENTS.md'))) {
    throw new Error(`Plugin sources are missing or incomplete in ${pluginSource}.`);
  }

  const requestedWorkspace = path.resolve(options.values.workspace || process.cwd());
  const home = path.resolve(options.values.home || os.homedir());
  if (!fs.existsSync(requestedWorkspace) || !fs.statSync(requestedWorkspace).isDirectory()) throw new Error(`Workspace directory not found: ${requestedWorkspace}`);
  const workspace = fs.realpathSync(requestedWorkspace);

  const targets = selectTargets(options);
  if (!targets.length) throw new Error('No installation target selected.');
  const uninstall = flags.has('--uninstall');
  const update = flags.has('--update');
  const foundApps = [];
  const skippedApps = [];
  const seenPlugins = new Set();

  for (const target of targets) {
    const destination = destinationFor(target, workspace, home);
    const label = target.kind === 'plugin'
      ? `Antigravity plugin (${destination})`
      : target.kind === 'codexPlugin'
        ? `Codex MCP plugin (${destination})`
        : `Skills (${destination})`;
    console.log(`${uninstall ? 'Removing' : 'Installing'} ${label}`);

    if (uninstall) {
      if (target.kind === 'plugin' || target.kind === 'codexPlugin') {
        if (target.kind === 'codexPlugin') {
          updateMarketplace(path.join(target.scope === 'local' ? workspace : home, '.agents', 'plugins', 'marketplace.json'), destination, target.scope === 'local' ? workspace : home, true);
        }
        removePath(destination);
      } else {
        for (const name of skillNames) removePath(path.join(destination, name));
      }
      console.log('  ✓ ArtCraft files removed.');
      continue;
    }

    if (target.kind === 'plugin' || target.kind === 'codexPlugin') {
      const isCodex = target.kind === 'codexPlugin';
      if (isCodex && seenPlugins.has(destination)) continue;
      const installed = installPlugin(
        destination,
        options.values.appDirs || [],
        workspace,
        target.kind === 'plugin' && target.scope === 'global',
        isCodex,
        target.scope === 'local' ? workspace : home,
        flags.has('--allow-unconfined'),
      );
      foundApps.push(...installed.found);
      skippedApps.push(...installed.skipped);
      if (isCodex) seenPlugins.add(destination);
      console.log(`  ✓ Plugin${target.kind === 'plugin' && target.scope === 'global' ? ` and ${skillNames.length} skills` : ''} installed.`);
    } else {
      installSkills(destination, update);
    }
  }

  if (!uninstall && targets.some((target) => target.kind === 'plugin' || target.kind === 'codexPlugin')) {
    const uniqueApps = [...new Map(foundApps.map((app) => [app.id, app])).values()];
    const uniqueSkipped = [...new Map(skippedApps.map((app) => [app.id, app])).values()];
    if (uniqueApps.length) {
      console.log('\nDetected ArtCraft MCP applications:');
      for (const app of uniqueApps) console.log(`  ${app.confined ? '✓' : '⚠'} ${app.app}: ${app.command}${app.confined ? '' : ' (sem confinamento de arquivos)'}`);
    } else if (!uniqueSkipped.length) {
      const location = options.values.appDirs?.length ? 'the supplied app directories' : 'PATH or standard install folders';
      console.log(`\nNo ArtCraft CLI binaries were found in ${location}.`);
      console.log('The plugin was installed with empty MCP server lists. Install the apps and rerun this command to configure them.');
    }
    if (uniqueSkipped.length) {
      console.log(`\nSkipped without --allow-unconfined because their MCP CLIs do not enforce file roots: ${uniqueSkipped.map((app) => app.app).join(', ')}.`);
    }
  }

  if (!uninstall && targets.some((target) => target.kind === 'codexPlugin')) {
    console.log('\nCodex marketplace entry created. Open the local ArtCraft marketplace in Codex and enable the plugin.');
    console.log(`MCP reads are scoped to ${workspace}; writes are limited to .tmp, renders and exports inside it.`);
  }
}

try {
  perform(parseArgs(process.argv.slice(2)));
} catch (error) {
  console.error(`ArtCraft installer: ${error.message}`);
  process.exitCode = 1;
}
