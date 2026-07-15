import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const pluginRoot = path.join(root, 'plugins', 'seongho-ops');

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

test('marketplace points at the packaged plugin', async () => {
  const marketplace = await readJson(path.join(root, '.agents', 'plugins', 'marketplace.json'));

  assert.equal(marketplace.name, 'seongho-ops');
  assert.equal(marketplace.plugins.length, 1);
  assert.equal(marketplace.plugins[0].name, 'seongho-ops');
  assert.equal(marketplace.plugins[0].source.path, './plugins/seongho-ops');
});
test('plugin manifest exposes one focused skill directory', async () => {
  const manifest = await readJson(path.join(pluginRoot, '.codex-plugin', 'plugin.json'));

  assert.equal(manifest.name, 'seongho-ops');
  assert.equal(manifest.version, '0.1.1');
  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.interface.composerIcon, './assets/plugin-icon.svg');
  assert.equal(manifest.interface.logo, './assets/plugin-icon.svg');
});

test('cli-routing keeps hard routes and auth recovery in lazy references', async () => {
  const skillRoot = path.join(pluginRoot, 'skills', 'cli-routing');
  const skill = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const routes = await readFile(path.join(skillRoot, 'references', 'routes.md'), 'utf8');
  const auth = await readFile(path.join(skillRoot, 'references', 'auth-recovery.md'), 'utf8');

  assert.match(skill, /^---\nname: cli-routing\n/);
  assert.match(skill, /references\/routes\.md/);
  assert.match(skill, /references\/auth-recovery\.md/);
  assert.match(routes, /Datadog[\s\S]*Hard route/);
  assert.match(routes, /Sentry[\s\S]*Hard route/);
  assert.match(auth, /# CLI Authentication Recovery/);
});

test('package and skill wrapper expose only k', async () => {
  const packageJson = await readJson(path.join(root, 'package.json'));
  const wrapper = await readFile(
    path.join(pluginRoot, 'skills', 'cli-routing', 'scripts', 'k'),
    'utf8',
  );
  const built = await readFile(path.join(pluginRoot, 'bin', 'k.js'), 'utf8');

  assert.deepEqual(Object.keys(packageJson.bin), ['k']);
  assert.match(wrapper, /PLUGIN_ROOT/);
  assert.match(wrapper, /bin\/k\.js/);
  assert.match(built, /^#!\/usr\/bin\/env node/);
});
