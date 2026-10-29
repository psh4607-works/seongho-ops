import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
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
  assert.equal(manifest.version, '0.6.10');
  assert.equal(packageJson.version, '0.6.10');
  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.interface.composerIcon, './assets/plugin-icon.svg');
  assert.equal(manifest.interface.logo, './assets/plugin-icon.svg');
  assert.ok(manifest.interface.capabilities.includes('Brainstorming'));
  assert.ok(manifest.interface.capabilities.includes('Completion verification'));
  assert.ok(manifest.interface.capabilities.includes('Systematic debugging'));
  assert.ok(manifest.interface.capabilities.includes('Argo CD operations'));
  assert.ok(
    manifest.interface.defaultPrompt.some((prompt) => prompt.includes('Clarify this change')),
  );
  assert.ok(
    manifest.interface.defaultPrompt.some((prompt) => prompt.includes('Verify this work')),
  );
  assert.ok(
    manifest.interface.defaultPrompt.some((prompt) => prompt.includes('Debug this failure')),
  );
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

test('1Password routing resolves to a packaged, implicitly discoverable skill', async () => {
  const manifest = await readJson(path.join(pluginRoot, '.codex-plugin', 'plugin.json'));
  const skillRoot = path.resolve(pluginRoot, manifest.skills, '1password');
  const target = path.join(skillRoot, 'SKILL.md');
  const skill = await readFile(target, 'utf8');
  const agent = await readFile(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');

  assert.match(skill, /^---\nname: 1password\n/);
  assert.match(agent, /allow_implicit_invocation: true/);

  const routingRoot = path.resolve(pluginRoot, manifest.skills, 'cli-routing');
  for (const relative of ['SKILL.md', 'references/routes.md', 'references/auth-recovery.md']) {
    const document = path.join(routingRoot, relative);
    const markdown = await readFile(document, 'utf8');
    const links = [...markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)[^)]*\)/g)]
      .map((match) => match[1].split('#')[0])
      .filter((href) => href && !href.startsWith('/') && !/^[a-z][a-z0-9+.-]*:/i.test(href));
    const resolved = links.map((href) => path.resolve(path.dirname(document), href));

    assert.ok(resolved.includes(target), `${relative} must route to the packaged 1Password skill`);
    for (const linkedFile of resolved) {
      const info = await stat(linkedFile).catch(() => null);
      assert.ok(info?.isFile(), `${document} has a broken link: ${linkedFile}`);
    }
  }
});

test('code-convention is discoverable with packaged references and a qualified invocation', async () => {
  const manifest = await readJson(path.join(pluginRoot, '.codex-plugin', 'plugin.json'));
  const skillRoot = path.resolve(pluginRoot, manifest.skills, 'code-convention');
  const skill = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const agent = await readFile(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');
  const invocation = `$${manifest.name}:code-convention`;

  assert.match(skill, /^---\nname: code-convention\n/);
  assert.match(agent, /allow_implicit_invocation: true/);
  assert.ok(agent.includes(invocation));
  assert.ok(manifest.interface.defaultPrompt.some((prompt) => prompt.includes(invocation)));
  assert.ok(manifest.interface.capabilities.includes('Code conventions and design-system consistency'));

  const references = [...skill.matchAll(/\[[^\]]+\]\(([^)\s]+)[^)]*\)/g)]
    .map((match) => match[1].split('#')[0])
    .filter((href) => href && !href.startsWith('/') && !/^[a-z][a-z0-9+.-]*:/i.test(href))
    .map((href) => path.posix.normalize(href));
  assert.deepEqual([...new Set(references)].sort(), [
    'references/react.md',
    'references/typescript.md',
  ]);
  for (const reference of references) {
    const target = path.resolve(skillRoot, reference);
    assert.ok(target.startsWith(`${skillRoot}${path.sep}`), 'reference must stay inside the skill');
    const info = await stat(target).catch(() => null);
    assert.ok(info?.isFile(), `${reference} must be packaged`);
    assert.ok((await readFile(target, 'utf8')).trim().length > 0, `${reference} must not be empty`);
  }
});

test('Argo CD guidance scopes RBAC decisions to the exact API capability', async () => {
  const routingRoot = path.join(pluginRoot, 'skills', 'cli-routing');
  const routes = await readFile(path.join(routingRoot, 'references', 'routes.md'), 'utf8');
  const skillRoot = path.join(pluginRoot, 'skills', 'argocd');
  const skill = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const agent = await readFile(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');

  assert.match(skill, /^---\nname: argocd\n/);
  assert.match(agent, /allow_implicit_invocation: true/);

  assert.match(
    routes,
    /Kubernetes RBAC[\s\S]*Argo CD API RBAC for `projects`[\s\S]*Argo CD API RBAC for `applications` and individual actions/i,
  );
  assert.match(
    routes,
    /`kubectl auth can-i` denial[\s\S]*must not be generalized[\s\S]*Argo CD API denial/i,
  );

  assert.match(
    skill,
    /argocd account can-i <action> applications '<PROJECT>\/<APP_NAME>'/,
  );
  assert.match(
    skill,
    /project `get` failure[\s\S]*must not be generalized[\s\S]*application `update` or `sync` failure/i,
  );
  assert.match(
    skill,
    /`kubectl auth can-i` denial[\s\S]*must not be generalized[\s\S]*Argo CD API denial/i,
  );

  // A hypothetical example keeps Kubernetes and project denials separate from
  // Application permissions without publishing a real target or incident.
  assert.match(
    skill,
    /`kubectl auth can-i patch applications\.argoproj\.io -n argocd`[\s\S]*`no`/i,
  );
  assert.match(skill, /`argocd account can-i get projects '<PROJECT>'`[\s\S]*`no`/i);
  assert.match(
    skill,
    /`argocd account can-i update applications '<PROJECT>\/<APP_NAME>'`[\s\S]*`yes`/i,
  );
  assert.match(
    skill,
    /`argocd account can-i sync applications '<PROJECT>\/<APP_NAME>'`[\s\S]*`yes`/i,
  );
  assert.match(skill, /Application update and sync remain available/i);
});

test('Argo CD target instructions agree with the private configuration example', async () => {
  const readme = await readFile(path.join(root, 'README.md'), 'utf8');
  const skill = await readFile(path.join(pluginRoot, 'skills', 'argocd', 'SKILL.md'), 'utf8');
  const auth = await readFile(
    path.join(pluginRoot, 'skills', 'cli-routing', 'references', 'auth-recovery.md'),
    'utf8',
  );
  const routingRoot = path.join(pluginRoot, 'skills', 'cli-routing');
  const documents = [
    {
      file: path.join(pluginRoot, 'skills', 'argocd', 'SKILL.md'),
      markdown: skill,
      requiresLogin: true,
      publicTokens: ['applications.argoproj.io', 'private-config.json'],
    },
    {
      file: path.join(routingRoot, 'references', 'auth-recovery.md'),
      markdown: auth,
      requiresLogin: true,
      publicTokens: ['SKILL.md'],
    },
    {
      file: path.join(routingRoot, 'SKILL.md'),
      markdown: await readFile(path.join(routingRoot, 'SKILL.md'), 'utf8'),
      publicTokens: ['SKILL.md', 'aside.md', 'auth-recovery.md', 'google-workspace.md', 'jev.md', 'k.js', 'routes.md', 'vscode.md'],
    },
    {
      file: path.join(routingRoot, 'references', 'routes.md'),
      markdown: await readFile(path.join(routingRoot, 'references', 'routes.md'), 'utf8'),
      publicTokens: ['SKILL.md', 'aside.md', 'google-workspace.md', 'jev.md', 'vercel.app', 'vscode.md'],
    },
  ];
  const exampleBlock = [...readme.matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g)]
    .find((match) => /"argocd"[ \t]*:/.test(match[1]));
  assert.ok(exampleBlock, 'document a private Argo CD configuration example');
  const example = JSON.parse(exampleBlock[1]);
  assert.ok(example?.argocd && typeof example.argocd === 'object');
  for (const value of Object.values(example.argocd)) {
    assert.equal(typeof value, 'string', 'public target examples must use string placeholders');
    assert.match(value, /^<[A-Z][A-Z0-9_]*>$/, 'public target examples must use placeholders');
  }

  const fields = [...skill.matchAll(/`argocd\.([A-Za-z][A-Za-z0-9]*)`/g)]
    .map((match) => match[1]);
  assert.deepEqual([...new Set(fields)].sort(), Object.keys(example.argocd).sort());
  const configurationPath = readme.match(/`(~\/[^`]+\/private-config\.json)`/)?.[1];
  assert.ok(configurationPath, 'keep the documented private configuration outside the checkout');
  assert.ok(skill.includes(`\`${configurationPath}\``));

  // Public symbols and filenames are reviewed per document; new package files
  // and links must not silently weaken the address check.
  for (const { file: document, markdown, requiresLogin, publicTokens } of documents) {
    const commands = markdown.replace(/\\\r?\n[ \t]*/g, ' ');
    const logins = [...commands.matchAll(/\bargocd login[ \t]+([^\s`]+)([^\n`]*)/g)];
    if (requiresLogin) assert.ok(logins.length > 0, `${document} must document login`);
    for (const [, server, options] of logins) {
      assert.equal(server, "'<ARGOCD_SERVER>'", `${document} must not publish a concrete login host`);
      assert.ok(options.split(/\s+/).includes('--sso'), `${document} must retain SSO login`);
    }
    const targetArguments = [
      /\bargocd app [a-z-]+[ \t]+([^\s`-][^\s`]*)/g,
      /\bargocd account can-i[ \t]+\S+[ \t]+(?:applications|projects)[ \t]+([^\s`]+)/g,
      /--(?:server|project|app|grpc-web-root-path)(?:[ \t]+|=)([^\s`]+)/g,
    ];
    for (const pattern of targetArguments) {
      for (const [, target] of commands.matchAll(pattern)) {
        assert.match(
          target,
          /^'<[A-Z][A-Z0-9_]*>(?:\/<[A-Z][A-Z0-9_]*>)?'$/,
          `${document} must not publish a concrete command target`,
        );
      }
    }
    const publicIdentifiers = new Set([
      ...publicTokens,
      ...Object.keys(example.argocd).map((field) => `argocd.${field}`),
    ]);
    const concreteHosts = [...markdown.matchAll(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi)]
      .map((match) => match[0])
      .filter((token) => !publicIdentifiers.has(token));
    assert.deepEqual(concreteHosts, [], `${document} must not publish a concrete host`);
    const addressLiterals = [
      /\b\d{1,3}(?:\.\d{1,3}){3}\b/g,
      /\b[a-z][a-z0-9-]*:\d+\b/gi,
      /\[[a-f0-9:.]*:[a-f0-9:.]+\](?::\d+)?/gi,
    ];
    for (const pattern of addressLiterals) {
      assert.deepEqual([...markdown.matchAll(pattern)], [], `${document} must not publish an address literal`);
    }
  }
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

test('write-korean packages its independent rulebook, attribution and qualified invocation', async () => {
  const manifest = await readJson(path.join(pluginRoot, '.codex-plugin', 'plugin.json'));
  const skillRoot = path.resolve(pluginRoot, manifest.skills, 'write-korean');
  const skill = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const agent = await readFile(path.join(skillRoot, 'agents', 'openai.yaml'), 'utf8');
  const invocation = `$${manifest.name}:write-korean`;
  assert.match(skill, /^---\nname: write-korean\n/);
  assert.match(agent, /allow_implicit_invocation: true/);
  assert.ok(agent.includes(invocation));
  assert.ok(manifest.interface.defaultPrompt.some((prompt) => prompt.includes(invocation)));
  assert.ok(manifest.interface.capabilities.includes('Korean writing and selective polishing'));

  for (const name of ['SKILL.md', 'references/korean-polishing.md', 'NOTICE.md', 'LICENSE']) {
    const file = path.join(skillRoot, name);
    const content = await readFile(file, 'utf8');
    assert.ok(content.trim().length > 0, `${name} must not be empty`);
    for (const match of content.matchAll(/\[[^\]]+\]\(([^)\s]+)[^)]*\)/g)) {
      const href = match[1].split('#')[0];
      if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
      const target = path.resolve(path.dirname(file), href);
      assert.ok(target.startsWith(`${skillRoot}${path.sep}`), 'reference must stay inside the skill');
      assert.ok((await stat(target)).isFile(), `${href} must be packaged`);
    }
  }
});
