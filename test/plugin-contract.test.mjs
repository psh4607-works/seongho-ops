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
test('plugin manifest exposes the packaged skill directory', async () => {
  const manifest = await readJson(path.join(pluginRoot, '.codex-plugin', 'plugin.json'));
  const packageJson = await readJson(path.join(root, 'package.json'));

  assert.equal(manifest.name, 'seongho-ops');
  assert.equal(manifest.version, '0.4.0');
  assert.equal(packageJson.version, '0.4.0');
  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.interface.composerIcon, './assets/plugin-icon.svg');
  assert.equal(manifest.interface.logo, './assets/plugin-icon.svg');
});

test('protected preview skill keeps cookie handling inside the runtime helper', async () => {
  const skillRoot = path.join(pluginRoot, 'skills', 'vercel-preview-browser');
  const skill = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const agent = await readFile(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');
  const runtime = await readFile(
    path.join(pluginRoot, 'runtime', 'vercel-preview-iab.js'),
    'utf8',
  );

  assert.match(skill, /^---\nname: vercel-preview-browser\n/);
  assert.match(skill, /browser:control-in-app-browser/);
  assert.match(skill, /vercel-preview-iab\.js/);
  assert.match(skill, /Never print, return, or persist the bypass cookie/);
  assert.match(agent, /Vercel Preview Browser/);
  assert.match(runtime, /x-vercel-set-bypass-cookie/);
  assert.doesNotMatch(runtime, /VERCEL_AUTOMATION_BYPASS_SECRET\s*=/);
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

test('portable TDD skill is implicitly invocable without global instructions', async () => {
  const skillRoot = path.join(pluginRoot, 'skills', 'test-driven-development');
  const skill = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const agent = await readFile(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');

  assert.match(
    skill,
    /^---\nname: test-driven-development\ndescription: Use when .*feature.*bug fix.*refactor.*behavior change.*before writing production code\n---/s,
  );
  assert.match(skill, /NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST/);
  assert.match(skill, /Verify RED/);
  assert.match(skill, /Verify GREEN/);
  assert.match(skill, /explicit user approval/);
  assert.match(agent, /allow_implicit_invocation: true/);
  assert.doesNotMatch(skill, /REQUIRED SUB-SKILL:.*superpowers:/);
});

test('performance engineering skill is scoped and progressively disclosed', async () => {
  const skillRoot = path.join(pluginRoot, 'skills', 'performance-engineering');
  const skill = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const agent = await readFile(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');
  const references = await Promise.all(
    ['measurement.md', 'frontend.md', 'backend.md', 'database.md'].map((file) =>
      readFile(path.join(skillRoot, 'references', file), 'utf8'),
    ),
  );

  assert.match(skill, /^---\nname: performance-engineering\n/);
  assert.match(skill, /references\/measurement\.md/);
  assert.match(skill, /references\/frontend\.md/);
  assert.match(skill, /references\/backend\.md/);
  assert.match(skill, /references\/database\.md/);
  assert.match(agent, /allow_implicit_invocation: true/);
  assert.ok(references.every((reference) => reference.length > 0));
});
