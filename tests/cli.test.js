'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'bin', 'cli.js');
const expectedSkills = ['artcraft-frontend', 'artcraft-image', 'artcraft-pitchdeck', 'artcraft-video'];

function tempDirectory(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runCli(args, cwd, env = process.env) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, env, encoding: 'utf8' });
}

function listDirectories(dir) {
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((name) => fs.statSync(path.join(dir, name)).isDirectory()).sort()
    : [];
}

test('local install copies one canonical set of skills and uninstall preserves unrelated files', (t) => {
  const workspace = tempDirectory('artcraft-local-');
  t.after(() => fs.rmSync(workspace, { recursive: true, force: true }));

  const installed = runCli(['--local', '--workspace', workspace], workspace);
  assert.equal(installed.status, 0, installed.stderr);
  const skillsDir = path.join(workspace, '.agents', 'skills');
  assert.deepEqual(listDirectories(skillsDir), expectedSkills);
  for (const name of expectedSkills) {
    assert.ok(fs.existsSync(path.join(skillsDir, name, 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(skillsDir, name, 'agents', 'openai.yaml')));
  }

  const sentinel = path.join(skillsDir, 'keep.txt');
  fs.writeFileSync(sentinel, 'keep');
  const removed = runCli(['--local', '--workspace', workspace, '--uninstall'], workspace);
  assert.equal(removed.status, 0, removed.stderr);
  assert.equal(fs.readFileSync(sentinel, 'utf8'), 'keep');
  assert.deepEqual(listDirectories(skillsDir), []);
});

test('update removes stale files from only the selected ArtCraft skill folders', (t) => {
  const workspace = tempDirectory('artcraft-update-');
  t.after(() => fs.rmSync(workspace, { recursive: true, force: true }));
  const skillsDir = path.join(workspace, '.agents', 'skills');
  const staleFile = path.join(skillsDir, 'artcraft-image', 'old-reference.md');
  fs.mkdirSync(path.dirname(staleFile), { recursive: true });
  fs.writeFileSync(staleFile, 'stale');

  const updated = runCli(['--local', '--workspace', workspace, '--update'], workspace);
  assert.equal(updated.status, 0, updated.stderr);
  assert.equal(fs.existsSync(staleFile), false);
  assert.ok(fs.existsSync(path.join(skillsDir, 'artcraft-image', 'references', 'formats-and-scale.md')));
});

test('local Antigravity install writes portable configs and one canonical skill set', (t) => {
  const workspace = tempDirectory('artcraft-plugin-');
  const fakeBin = path.join(workspace, 'bin');
  fs.mkdirSync(fakeBin);
  const fakeExecutable = path.join(fakeBin, process.platform === 'win32' ? 'effectcraft-cli.exe' : 'effectcraft-cli');
  fs.writeFileSync(fakeExecutable, 'mock binary');
  if (process.platform !== 'win32') fs.chmodSync(fakeExecutable, 0o755);
  const plugin = path.join(workspace, '.agents', 'plugins', 'artcraft-suite');
  fs.mkdirSync(plugin, { recursive: true });
  const customSkill = path.join(plugin, 'skills', 'custom-skill', 'SKILL.md');
  fs.mkdirSync(path.dirname(customSkill), { recursive: true });
  fs.writeFileSync(customSkill, '---\nname: custom-skill\ndescription: Custom local workflow.\n---\n');
  fs.writeFileSync(path.join(plugin, 'mcp_config.json'), JSON.stringify({
    mcpServers: { custom: { command: 'custom-cli', args: ['serve'] } },
  }));
  fs.writeFileSync(path.join(plugin, 'mcp.json'), JSON.stringify({
    mcpServers: { custom: { type: 'stdio', command: 'custom-cli', args: ['serve'] } },
  }));
  t.after(() => fs.rmSync(workspace, { recursive: true, force: true }));

  const installed = runCli(['--antigravity', '--local', '--workspace', workspace, '--app-dir', fakeBin], workspace);
  assert.equal(installed.status, 0, installed.stderr);

  assert.deepEqual(listDirectories(path.join(plugin, 'skills')), ['custom-skill']);
  assert.ok(fs.existsSync(customSkill));
  assert.deepEqual(listDirectories(path.join(workspace, '.agents', 'skills')), expectedSkills);
  const antigravityConfig = JSON.parse(fs.readFileSync(path.join(plugin, 'mcp_config.json'), 'utf8'));
  assert.deepEqual(Object.keys(antigravityConfig.mcpServers), ['custom', 'effectcraft']);
  assert.equal(antigravityConfig.mcpServers.effectcraft.command, fakeExecutable);
  const antigravityArgs = antigravityConfig.mcpServers.effectcraft.args;
  assert.equal(antigravityArgs[antigravityArgs.indexOf('--automation-read-root') + 1], workspace);
  const writeRoots = antigravityArgs.flatMap((argument, index) => argument === '--automation-write-root' ? [antigravityArgs[index + 1]] : []);
  assert.deepEqual(writeRoots, ['.tmp', 'renders', 'exports'].map((directory) => path.join(workspace, directory)));
  for (const directory of ['.tmp', 'renders', 'exports']) assert.ok(fs.existsSync(path.join(workspace, directory)));

  const codexConfig = JSON.parse(fs.readFileSync(path.join(plugin, 'mcp.json'), 'utf8'));
  assert.deepEqual(Object.keys(codexConfig.mcpServers), ['custom', 'effectcraft']);
  assert.equal(codexConfig.mcpServers.custom.command, 'custom-cli');
  assert.equal(codexConfig.mcpServers.effectcraft.type, 'stdio');
  assert.equal(codexConfig.mcpServers.effectcraft.cwd, workspace);
  assert.deepEqual(codexConfig.mcpServers.effectcraft.args, antigravityArgs);
});

test('global install creates Antigravity and Codex destinations and a marketplace entry', (t) => {
  const workspace = tempDirectory('artcraft-global-');
  const home = path.join(workspace, 'home');
  const emptyPath = path.join(workspace, 'empty-path');
  fs.mkdirSync(emptyPath);
  t.after(() => fs.rmSync(workspace, { recursive: true, force: true }));

  const installed = runCli(['--global', '--home', home, '--app-dir', emptyPath], workspace);
  assert.equal(installed.status, 0, installed.stderr);

  const codexSkills = path.join(home, '.agents', 'skills');
  const plugin = path.join(home, '.gemini', 'config', 'plugins', 'artcraft-suite');
  const codexPlugin = path.join(home, '.codex', 'plugins', 'artcraft-suite');
  assert.deepEqual(listDirectories(codexSkills), expectedSkills);
  assert.deepEqual(listDirectories(path.join(plugin, 'skills')), expectedSkills);
  const configText = fs.readFileSync(path.join(plugin, 'mcp_config.json'), 'utf8');
  assert.deepEqual(JSON.parse(configText), { mcpServers: {} });
  assert.doesNotMatch(configText, /[A-Z]:\\Users\\|C:\/Users\//i);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(codexPlugin, 'mcp.json'), 'utf8')).mcpServers, {});
  const marketplace = JSON.parse(fs.readFileSync(path.join(home, '.agents', 'plugins', 'marketplace.json'), 'utf8'));
  assert.equal(marketplace.plugins[0].name, 'artcraft-suite');
  assert.equal(marketplace.plugins[0].source.path, './.codex/plugins/artcraft-suite');
});

test('unconfined app servers are skipped unless the user opts in', (t) => {
  const workspace = tempDirectory('artcraft-unconfined-');
  const fakeBin = path.join(workspace, 'bin');
  fs.mkdirSync(fakeBin);
  for (const executable of ['filmcraft-cli', 'lightcraft-cli']) {
    const file = path.join(fakeBin, process.platform === 'win32' ? `${executable}.exe` : executable);
    fs.writeFileSync(file, 'mock binary');
    if (process.platform !== 'win32') fs.chmodSync(file, 0o755);
  }
  t.after(() => fs.rmSync(workspace, { recursive: true, force: true }));

  const skipped = runCli(['--antigravity', '--local', '--workspace', workspace, '--app-dir', fakeBin], workspace);
  assert.equal(skipped.status, 0, skipped.stderr);
  assert.match(skipped.stdout, /Skipped without --allow-unconfined/);
  const plugin = path.join(workspace, '.agents', 'plugins', 'artcraft-suite');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(plugin, 'mcp_config.json'), 'utf8')).mcpServers, {});
  assert.equal(fs.existsSync(path.join(workspace, 'renders')), false);

  const optedIn = runCli(['--antigravity', '--local', '--workspace', workspace, '--app-dir', fakeBin, '--allow-unconfined'], workspace);
  assert.equal(optedIn.status, 0, optedIn.stderr);
  const config = JSON.parse(fs.readFileSync(path.join(plugin, 'mcp_config.json'), 'utf8'));
  assert.deepEqual(Object.keys(config.mcpServers).sort(), ['filmcraft', 'lightcraft']);
  assert.deepEqual(config.mcpServers.filmcraft.args, ['mcp']);
  assert.deepEqual(config.mcpServers.lightcraft.args, ['mcp', '--compact']);
});

test('Codex uninstall removes its marketplace entry and preserves other plugins', (t) => {
  const workspace = tempDirectory('artcraft-codex-remove-');
  t.after(() => fs.rmSync(workspace, { recursive: true, force: true }));
  const marketplaceDir = path.join(workspace, '.agents', 'plugins');
  fs.mkdirSync(marketplaceDir, { recursive: true });
  fs.writeFileSync(path.join(marketplaceDir, 'marketplace.json'), JSON.stringify({
    name: 'team-marketplace',
    plugins: [{ name: 'keep-plugin', source: { source: 'local', path: './keep-plugin' } }],
  }));

  const installed = runCli(['--codex', '--local', '--workspace', workspace, '--app-dir', path.join(workspace, 'empty')], workspace);
  assert.equal(installed.status, 0, installed.stderr);
  const beforeRemoval = JSON.parse(fs.readFileSync(path.join(marketplaceDir, 'marketplace.json'), 'utf8'));
  assert.equal(beforeRemoval.plugins.find((entry) => entry.name === 'artcraft-suite').source.path, './.agents/plugins/artcraft-suite');
  const removed = runCli(['--codex', '--local', '--workspace', workspace, '--uninstall'], workspace);
  assert.equal(removed.status, 0, removed.stderr);

  const marketplace = JSON.parse(fs.readFileSync(path.join(marketplaceDir, 'marketplace.json'), 'utf8'));
  assert.equal(marketplace.name, 'team-marketplace');
  assert.deepEqual(marketplace.plugins.map((entry) => entry.name), ['keep-plugin']);
  assert.equal(fs.existsSync(path.join(marketplaceDir, 'artcraft-suite')), false);
  assert.deepEqual(listDirectories(path.join(workspace, '.agents', 'skills')), []);
});

test('invalid target combinations fail with a useful error', (t) => {
  const workspace = tempDirectory('artcraft-invalid-');
  t.after(() => fs.rmSync(workspace, { recursive: true, force: true }));
  const result = runCli(['--local', '--global', '--workspace', workspace], workspace);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Choose either --local or --global/);

  const unknown = runCli(['--locla'], workspace);
  assert.notEqual(unknown.status, 0);
  assert.match(unknown.stderr, /Unknown option: --locla/);
});
