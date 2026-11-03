import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { lstat, mkdtemp, readFile, readdir, readlink, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const codexPluginRoot = path.join(root, 'plugins', 'seongho-ops');
const codexSkillsRoot = path.join(codexPluginRoot, 'skills');
const claudePluginRoot = path.join(root, 'claude', 'seongho-ops');

// Codex 인앱 브라우저처럼 Codex에서만 동작하는 도구에 의존해 Claude 패키지에 연결하지 않는 스킬
const CODEX_ONLY_SKILLS = ['vercel-preview-browser'];

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function listDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

async function assertRelativeLink(link, expectedTarget) {
  const name = path.relative(root, link);
  assert.ok((await lstat(link)).isSymbolicLink(), `${name} must be a symlink, not a copy`);
  const target = await readlink(link);
  assert.ok(!path.isAbsolute(target), `${name} must use a relative target`);
  assert.equal(path.resolve(path.dirname(link), target), expectedTarget);
}

async function listNonDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? listNonDirectories(file) : [file];
    }),
  );
  return nested.flat();
}

test('Claude marketplace lists the link-only plugin package', async () => {
  const marketplace = await readJson(path.join(root, '.claude-plugin', 'marketplace.json'));
  const codexMarketplace = await readJson(path.join(root, '.agents', 'plugins', 'marketplace.json'));

  assert.equal(marketplace.name, codexMarketplace.name);
  assert.equal(marketplace.owner.name, 'Seongho');
  assert.equal(marketplace.plugins.length, 1);
  assert.equal(marketplace.plugins[0].name, 'seongho-ops');
  assert.equal(marketplace.plugins[0].source, './claude/seongho-ops');
});

test('Claude manifest mirrors the Codex manifest metadata', async () => {
  const manifest = await readJson(path.join(claudePluginRoot, '.claude-plugin', 'plugin.json'));
  const codexManifest = await readJson(path.join(codexPluginRoot, '.codex-plugin', 'plugin.json'));
  const packageJson = await readJson(path.join(root, 'package.json'));

  for (const field of ['name', 'version', 'author', 'homepage', 'repository', 'license']) {
    assert.deepEqual(manifest[field], codexManifest[field], `${field} must match the Codex manifest`);
  }
  assert.equal(manifest.version, packageJson.version);
  assert.ok(manifest.description.trim().length > 0);
  assert.doesNotMatch(manifest.description, /protected preview/i, 'Codex-only features stay out');
});

test('Claude skills link every portable Codex skill without copies', async () => {
  const codexSkills = await listDirectories(codexSkillsRoot);
  const claudeSkills = (await readdir(path.join(claudePluginRoot, 'skills'))).sort();

  for (const excluded of CODEX_ONLY_SKILLS) {
    assert.ok(codexSkills.includes(excluded), `${excluded} must still exist in the Codex package`);
  }
  assert.deepEqual(
    claudeSkills,
    codexSkills.filter((name) => !CODEX_ONLY_SKILLS.includes(name)),
    'link each new Codex skill or record it as Codex-only',
  );
  for (const name of claudeSkills) {
    const link = path.join(claudePluginRoot, 'skills', name);
    await assertRelativeLink(link, path.join(codexSkillsRoot, name));
    assert.ok((await stat(path.join(link, 'SKILL.md'))).isFile(), `${name}/SKILL.md must resolve`);
  }
});

test('Claude package resolves plugin-root resources used by linked skills', async (t) => {
  const link = path.join(claudePluginRoot, 'bin', 'k.js');
  await assertRelativeLink(link, path.join(codexPluginRoot, 'bin', 'k.js'));

  // 가짜 node로 cli-routing의 scripts/k가 실행하려는 경로를 받아 Claude 패키지 루트 기준인지 확인한다
  const fakeBin = await mkdtemp(path.join(tmpdir(), 'seongho-ops-node-'));
  t.after(() => rm(fakeBin, { recursive: true, force: true }));
  await writeFile(path.join(fakeBin, 'node'), '#!/bin/sh\nprintf "%s" "$1"\n', { mode: 0o755 });
  const executed = execFileSync(path.join(claudePluginRoot, 'skills', 'cli-routing', 'scripts', 'k'), {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${fakeBin}${path.delimiter}${process.env.PATH}` },
  });

  assert.equal(executed, link);
});

test('Claude package holds only its manifest and symlinks', async () => {
  const files = await listNonDirectories(claudePluginRoot);
  const linked = await Promise.all(files.map(async (file) => (await lstat(file)).isSymbolicLink()));
  const regularFiles = files
    .filter((_, index) => !linked[index])
    .map((file) => path.relative(claudePluginRoot, file));

  assert.deepEqual(regularFiles, [path.join('.claude-plugin', 'plugin.json')]);
});
