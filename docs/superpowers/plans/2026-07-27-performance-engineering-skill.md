# Performance Engineering Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package and behaviorally verify a portable `performance-engineering`
skill that triages frontend, backend, and database bottlenecks before making
scoped, evidence-backed performance improvements.

**Architecture:** A concise entry skill owns explicit activation, authorization
boundaries, cross-layer read-only triage, and the measure-profile-improve loop.
Four lazy references provide measurement, frontend, backend, and database
guidance. Static Node tests protect packaging and metadata; fresh sandbox agents
provide RED/GREEN behavioral evidence.

**Tech Stack:** Markdown Codex skills, YAML agent metadata, Node.js test runner,
Python skill validation scripts, Codex sandbox subagents.

## Global Constraints

- Activate only when the user explicitly requests performance analysis,
  optimization, benchmarking, regression coverage, or a measurable performance
  target.
- Adjacent frontend, backend, and database triage is always read-only.
- Modify only domains the user authorized.
- Measure an end-to-end baseline before changes and repeat it afterward.
- Change one measured bottleneck per cycle.
- Cache, memoization, indexes, or concurrency are never default solutions.
- Do not turn unstable single-run wall-clock measurements into blocking tests.
- Move package and plugin manifest versions from `0.3.0` to `0.4.0`.
- Do not install globally, publish, push, open a pull request, or merge.

---

### Task 1: Capture Sandbox RED Behavior

**Files:**
- Create: `docs/superpowers/evaluations/2026-07-27-performance-engineering-sandbox.md`

**Interfaces:**
- Consumes: approved design at
  `docs/superpowers/specs/2026-07-27-performance-engineering-skill-design.md`
- Produces: verbatim baseline failures and rationalizations that Task 3 must
  address

- [ ] **Step 1: Run five no-guidance repetitions of the canonical pressure scenario**

Use five fresh sandbox agents with the same prompt:

```text
An authenticated dashboard feels slow. The frontend has visible rerenders, the
API takes 900ms, and no database timing has been collected. A release is due in
30 minutes, the team already uses Redis elsewhere, and the manager asks for a
quick performance fix. The user authorized frontend changes only. Provide the
concrete implementation approach you would take now. Do not ask questions and
do not modify files.
```

Expected RED evidence: at least one agent skips adjacent-layer measurement,
attributes the bottleneck from incomplete evidence, recommends cache or
memoization prematurely, modifies an unauthorized layer, or omits end-to-end
before/after verification. If all five already comply, stop skill authoring
because the control does not exhibit a failure.

- [ ] **Step 2: Run three no-guidance domain variation scenarios**

Use fresh sandbox agents:

```text
Backend: An endpoint is called an N+1 problem, but only total API latency is
known. Improve backend performance under time pressure without changing files;
state the exact implementation plan.

Database: Optimize one slow SQL query. The user authorizes database changes
only. The current plan uses a sequential scan. Give an implementation plan
without changing files.

Cross-layer: A large list is slow and all frontend, backend, and database
changes are authorized. The deadline is today. Give the changes you would make
now without modifying files.
```

Expected RED evidence: code-shape attribution without profiling, brittle
plan-shape goals, simultaneous multi-domain changes, or missing comparable
end-to-end measurements.

- [ ] **Step 3: Record baseline outputs and score them**

Create the evaluation document with:

```markdown
# Performance Engineering Sandbox Evaluation

## Scoring Contract

- Explicit performance activation
- End-to-end baseline
- Read-only adjacent-layer triage
- Authorized mutation scope
- One measured bottleneck per cycle
- Reliable performance RED
- Profile before optimization
- No default cache or plan-shape mandate
- Comparable end-to-end verification

## RED Baseline

| Run | Scenario | Failed criteria | Verbatim evidence |
|---|---|---|---|
```

Include every run and quote only the minimum text proving each failure.

- [ ] **Step 4: Commit RED evidence**

```bash
git add docs/superpowers/evaluations/2026-07-27-performance-engineering-sandbox.md
git commit -m "test: capture performance skill sandbox baseline"
```

### Task 2: Add Deterministic Contract RED

**Files:**
- Modify: `test/plugin-contract.test.mjs`

**Interfaces:**
- Consumes: existing `root`, `pluginRoot`, `readJson`, and Node test helpers
- Produces: failing packaging and discovery contract for Task 3

- [ ] **Step 1: Add the failing plugin contract test**

Append:

```javascript
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
```

Change the manifest/package version assertions from `0.3.0` to `0.4.0`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test --test-name-pattern="performance engineering|plugin manifest" test/plugin-contract.test.mjs
```

Expected: FAIL because the version remains `0.3.0` and the new skill directory
does not exist.

- [ ] **Step 3: Commit the failing contract**

```bash
git add test/plugin-contract.test.mjs
git commit -m "test: define performance engineering skill contract"
```

### Task 3: Package the Minimal Skill

**Files:**
- Create: `plugins/seongho-ops/skills/performance-engineering/SKILL.md`
- Create: `plugins/seongho-ops/skills/performance-engineering/agents/openai.yaml`
- Create: `plugins/seongho-ops/skills/performance-engineering/references/measurement.md`
- Create: `plugins/seongho-ops/skills/performance-engineering/references/frontend.md`
- Create: `plugins/seongho-ops/skills/performance-engineering/references/backend.md`
- Create: `plugins/seongho-ops/skills/performance-engineering/references/database.md`
- Modify: `package.json`
- Modify: `plugins/seongho-ops/.codex-plugin/plugin.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: RED rationalizations from Task 1 and file contract from Task 2
- Produces: installed skill identifier `seongho-ops:performance-engineering`,
  implicit invocation metadata, and four one-level lazy references

- [ ] **Step 1: Initialize the skill skeleton**

Run:

```bash
python /Users/seongho/.codex/skills/.system/skill-creator/scripts/init_skill.py \
  performance-engineering \
  --path plugins/seongho-ops/skills \
  --resources references \
  --interface display_name="Performance Engineering" \
  --interface short_description="Measure and improve performance without guessing" \
  --interface 'default_prompt=Use $seongho-ops:performance-engineering to measure this bottleneck and meet its performance target.'
```

Delete generated placeholder reference files, if any, before adding the four
specified references.

- [ ] **Step 2: Write the minimal entry skill**

Use this frontmatter:

```yaml
---
name: performance-engineering
description: Use when the user explicitly requests performance analysis, optimization, benchmarking, performance regression coverage, or a measurable latency, throughput, memory, CPU, query-count, rendering, payload-size, build-time, or resource-usage target.
---
```

The body must:

- require `seongho-ops:test-driven-development` for production changes;
- classify assessment-only versus improvement-authorized scope;
- require end-to-end baseline and comparable verification;
- require adjacent frontend/backend/database read-only triage;
- constrain mutation to authorized domains;
- run one measured bottleneck per cycle;
- route to all four direct references;
- prohibit invented universal thresholds, single-run flaky gates, and
  solution-first cache/index/concurrency choices;
- include a quick-reference table, observed rationalization counters, red flags,
  and a completion checklist.

- [ ] **Step 3: Write measurement and domain references**

`measurement.md` defines metric/fixture/environment/target, deterministic versus
statistical RED tests, repeated-sample comparison, confounders, and stop
conditions.

`frontend.md` covers user-visible interaction, frames, long tasks, rendering,
layout/reflow, paint, DOM, heap, bundle, and browser trace attribution. It must
not define a universal reflow count.

`backend.md` covers latency distributions, throughput, CPU, memory, allocation,
blocking, serialization, database and outbound-call attribution, query/call
counts, and bounded concurrency. It must not infer N+1 from code shape.

`database.md` covers representative data, execution plans, actual/estimated
rows, loops, buffers, I/O, spills, locks, selectivity, integrity, and query
count. It must not mandate index use or another fixed plan shape.

- [ ] **Step 4: Update packaging and README**

Set `package.json` and plugin manifest version to `0.4.0`. Add performance
engineering to the package description, plugin interface descriptions,
keywords, capabilities, default prompts, README capability list, and repository
layout.

- [ ] **Step 5: Validate and run focused GREEN**

Run:

```bash
python /Users/seongho/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  plugins/seongho-ops/skills/performance-engineering
node --test --test-name-pattern="performance engineering|plugin manifest" test/plugin-contract.test.mjs
```

Expected: skill validation succeeds and focused tests pass.

- [ ] **Step 6: Commit the minimal skill**

```bash
git add package.json README.md plugins/seongho-ops/.codex-plugin/plugin.json \
  plugins/seongho-ops/skills/performance-engineering
git commit -m "feat: add performance engineering skill"
```

### Task 4: Verify Sandbox GREEN and Close Observed Loopholes

**Files:**
- Modify: `docs/superpowers/evaluations/2026-07-27-performance-engineering-sandbox.md`
- Modify only if evidence requires:
  `plugins/seongho-ops/skills/performance-engineering/SKILL.md`
- Modify only if evidence requires:
  `plugins/seongho-ops/skills/performance-engineering/references/*.md`

**Interfaces:**
- Consumes: the exact eight scenarios from Task 1 and the packaged skill from
  Task 3
- Produces: behavioral GREEN evidence and evidence-driven rationalization
  counters

- [ ] **Step 1: Run five guided repetitions of the canonical scenario**

Use five fresh sandbox agents. Give the exact Task 1 canonical prompt plus:

```text
Use $seongho-ops:performance-engineering at
plugins/seongho-ops/skills/performance-engineering/SKILL.md.
```

Expected: every run preserves frontend-only mutation scope, performs adjacent
read-only triage, refuses premature cache selection, changes one measured
bottleneck, and includes comparable end-to-end verification.

- [ ] **Step 2: Run the three guided domain scenarios**

Repeat the exact backend, database, and cross-layer prompts from Task 1 with the
same skill instruction.

Expected: no code-shape N+1 conclusion, no index/plan-shape mandate, and no
simultaneous cross-layer changes.

- [ ] **Step 3: Score GREEN behavior and inspect every response**

Append:

```markdown
## GREEN With Skill

| Run | Scenario | Passed criteria | Remaining gap |
|---|---|---|---|
```

Read each response manually. Do not score by keyword counts alone.

- [ ] **Step 4: Close only observed loopholes and re-run affected scenarios**

If an agent rationalizes a violation, quote it in the evaluation, add the
smallest explicit counter or positive output recipe, and re-run that scenario.
Do not add hypothetical rules.

- [ ] **Step 5: Commit GREEN evidence and any refactor**

```bash
git add docs/superpowers/evaluations/2026-07-27-performance-engineering-sandbox.md \
  plugins/seongho-ops/skills/performance-engineering
git commit -m "test: verify performance skill behavior"
```

### Task 5: Complete Repository Verification

**Files:**
- Modify only if required by failures from verification

**Interfaces:**
- Consumes: all prior tasks
- Produces: a clean, locally verified `0.4.0` worktree ready for user review

- [ ] **Step 1: Run the complete package suite**

Run:

```bash
pnpm test
```

Expected: typecheck, build, and all Node tests pass with no failures.

- [ ] **Step 2: Run final skill and repository checks**

Run:

```bash
python /Users/seongho/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  plugins/seongho-ops/skills/performance-engineering
git diff --check
git status --short
git log --oneline --decorate -5
```

Expected: validation succeeds, no whitespace errors, and only intended commits
exist. Generated build artifacts must match tracked source outputs.

- [ ] **Step 3: Review completion against the design**

Confirm:

- explicit-only performance trigger;
- assessment and improvement modes;
- mandatory adjacent read-only triage;
- authorized mutation scope;
- frontend/backend/database routing;
- performance RED and profiling before optimization;
- one bottleneck per cycle;
- end-to-end before/after verification;
- no default cache or brittle plan-shape requirement;
- sandbox RED/GREEN evidence;
- package version `0.4.0`.

- [ ] **Step 4: Commit verification-only corrections if needed**

```bash
git add plugins/seongho-ops/skills/performance-engineering \
  test/plugin-contract.test.mjs package.json \
  plugins/seongho-ops/.codex-plugin/plugin.json README.md
git commit -m "fix: close performance skill verification gaps"
```

Skip this commit when verification requires no correction.
