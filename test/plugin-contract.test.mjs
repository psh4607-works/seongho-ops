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

test('lightweight brainstorming scales design work to unresolved risk', async () => {
  const skillRoot = path.join(pluginRoot, 'skills', 'brainstorming');
  const skill = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const agent = await readFile(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');
  const wordCount = skill.trim().split(/\s+/).length;

  assert.match(
    skill,
    /^---\nname: brainstorming\ndescription: Use when .*non-trivial.*requirements.*boundaries.*trade-offs.*success criteria.*before implementation\n---/s,
  );
  assert.match(skill, /Inspect the current context/);
  assert.match(skill, /goal, constraints, unresolved decisions, and success criteria/i);
  assert.match(skill, /recommended approach/i);
  assert.match(skill, /approval before material or hard-to-reverse implementation/i);
  assert.match(skill, /provisional assumption does not authorize implementation/i);
  assert.match(skill, /Clear and reversible/);
  assert.match(skill, /No mandatory spec/i);
  assert.match(agent, /allow_implicit_invocation: true/);
  assert.ok(wordCount <= 250, `brainstorming must stay lightweight; found ${wordCount} words`);
  assert.doesNotMatch(skill, /superpowers:/);
});

test('lightweight verification requires fresh evidence for completion claims', async () => {
  const skillRoot = path.join(pluginRoot, 'skills', 'verification-before-completion');
  const skill = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const agent = await readFile(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');
  const wordCount = skill.trim().split(/\s+/).length;

  assert.match(
    skill,
    /^---\nname: verification-before-completion\ndescription: Use when .*complete.*fixed.*passing.*commit.*push.*pull request.*next task\n---/s,
  );
  assert.match(skill, /Identify the command or observation that proves each claim/i);
  assert.match(skill, /Run the smallest sufficient check freshly against the current state/i);
  assert.match(skill, /exit code, failure count, and relevant output/i);
  assert.match(skill, /state exactly what remains unverified/i);
  assert.match(skill, /Stale, partial, different-scope, CI-future, and agent-reported results are not fresh evidence/i);
  assert.match(agent, /allow_implicit_invocation: true/);
  assert.ok(
    wordCount <= 200,
    `verification-before-completion must stay lightweight; found ${wordCount} words`,
  );
  assert.doesNotMatch(skill, /superpowers:/);
});

test('lightweight systematic debugging requires evidence before fixes', async () => {
  const skillRoot = path.join(pluginRoot, 'skills', 'systematic-debugging');
  const skill = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const agent = await readFile(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');
  const wordCount = skill.trim().split(/\s+/).length;

  assert.match(
    skill,
    /^---\nname: systematic-debugging\ndescription: Use when .*bug.*test failure.*flaky.*incident.*build.*integration.*unexpected behavior.*before .*fix\n---/s,
  );
  assert.match(skill, /Capture the exact symptom, error, environment, and relevant recent change/i);
  assert.match(skill, /Reproduce the smallest case/i);
  assert.match(skill, /State one falsifiable hypothesis/i);
  assert.match(skill, /Run the smallest discriminating experiment; change one variable/i);
  assert.match(skill, /add a failing reproduction test/i);
  assert.match(skill, /Rerun the original symptom and relevant regression checks/i);
  assert.match(skill, /After three failed fix attempts, stop and question the assumptions or architecture/i);
  assert.match(agent, /allow_implicit_invocation: true/);
  assert.ok(wordCount <= 250, `systematic-debugging must stay lightweight; found ${wordCount} words`);
  assert.doesNotMatch(skill, /superpowers:/);
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

  // Activation is intentionally narrow: routine delivery work must not inherit
  // a performance workflow merely because it might be expensive.
  assert.match(
    skill,
    /^---[\s\S]*description: Use when the user explicitly requests performance[\s\S]*---/m,
  );
  assert.match(
    skill,
    /Do not activate for an?\s+ordinary feature, bug fix, refactor, test, or build[\s\S]*no performance target/i,
  );

  // Every improvement is cross-layer evidence gathering, but mutations remain
  // limited to the domain that the user authorized.
  assert.match(
    skill,
    /Triage frontend, backend, and database boundaries read-only[\s\S]*attribute the dominant bottleneck/i,
  );
  assert.match(
    skill,
    /modify only an authorized domain[\s\S]*adjacent-domain triage remains read-only/i,
  );
  assert.match(
    skill,
    /Capture a reproducible end-to-end baseline[\s\S]*comparable end-to-end path again/i,
  );
  assert.match(skill, /Select one measured bottleneck for this cycle/i);
  assert.match(skill, /Production changes require `seongho-ops:test-driven-development`/);

  // A performance RED only establishes test-first discipline when its expected
  // failure is observed before the production change.
  assert.match(
    skill,
    /Run the\s+focused functional and performance RED\s+and observe its expected failure\s+before making the production change/i,
  );

  assert.match(
    skill,
    /## Iron Law\s+NO PERFORMANCE PRODUCTION CHANGE WITHOUT RUNNING THE RED AND OBSERVING ITS EXPECTED FAILURE FIRST/,
  );

  // Stable counters can gate RED; time-based evidence must be sampled rather
  // than converted into a flaky one-run wall-clock test.
  assert.match(
    skill,
    /Deterministic measures[\s\S]*(?:query count|render count)[\s\S]*blocking RED tests/i,
  );
  assert.match(
    skill,
    /Noisy wall-clock measures[\s\S]*controlled repeated samples[\s\S]*never become a single-run flaky gate/i,
  );

  // Solution choices stay evidence-led. Cache safety is deliberately explicit
  // because a cache can otherwise hide a performance problem by breaking data
  // correctness or invalidation behavior.
  assert.match(skill, /Cache or memoization comes last and is never default/i);
  assert.match(skill, /An index or concurrency change[\s\S]*only after measurement/i);
  assert.match(
    skill,
    /repeated work is measured as dominant[\s\S]*correctness, key completeness, invalidation, isolation[\s\S]*(?:capacity or expiry)[\s\S]*concurrent writers[\s\S]*safe miss\/failure behavior/i,
  );

  // Each progressive reference owns a stable boundary that prevents a local
  // diagnostic signal from becoming a universal success condition or an unsafe
  // production operation.
  const [measurement, frontend, backend, database] = references;
  assert.match(
    measurement,
    /noisy wall-clock measures[\s\S]*repeated samples[\s\S]*single sample out of blocking CI/i,
  );
  assert.match(
    frontend,
    /Do not define a\s+universal reflow or repaint count as a success criterion/i,
  );
  assert.match(
    backend,
    /Treat N\+1 as a hypothesis, never a conclusion from code shape/i,
  );
  assert.match(database, /Do not mandate index use or any fixed plan shape/i);
  assert.match(
    database,
    /EXPLAIN ANALYZE[\s\S]*executes the statement[\s\S]*known read-only\s+statements[\s\S]*safe representative environment/i,
  );
  assert.match(
    database,
    /writes[\s\S]*non-executing\s+plans[\s\S]*explicitly authorized[\s\S]*controlled rollback/i,
  );
  assert.match(database, /live\s+production[\s\S]*impact controls/i);
});
