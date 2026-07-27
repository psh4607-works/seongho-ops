# Portable TDD Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package a portable, implicitly invocable `seongho-ops:test-driven-development` skill and release it as `seongho-ops` version `0.3.0`.

**Architecture:** A self-contained discipline skill lives under the plugin's existing `skills/` directory, with OpenAI metadata permitting implicit invocation. Contract tests enforce the trigger, TDD checkpoints, non-mutation of global instructions, and synchronized package/plugin versions; README documents the installed behavior and an optional local routing override.

**Tech Stack:** Markdown Agent Skills, OpenAI skill metadata YAML, Node.js 22 `node:test`, JSON plugin/package manifests, pnpm.

## Global Constraints

- Installation and normal use must not depend on modifying a user's global or repository `AGENTS.md`.
- The plugin must not depend on Superpowers at runtime.
- The skill applies before production code for features, bug fixes, refactoring, and behavior changes.
- Throwaway prototypes, generated code, and configuration-only changes require explicit user approval to skip TDD.
- Package and plugin manifest versions must both be `0.3.0`.
- Existing Node.js requirement remains `>=22`.

---

### Task 1: Establish RED behavior and a failing package contract

**Files:**
- Modify: `test/plugin-contract.test.mjs`
- Create outside repository: a temporary pressure-scenario transcript used only to compare behavior before and after the skill exists

**Interfaces:**
- Consumes: existing `root`, `pluginRoot`, `readJson`, and Node.js `test` helpers from `test/plugin-contract.test.mjs`
- Produces: a test named `portable TDD skill is implicitly invocable without global instructions`

- [ ] **Step 1: Run baseline pressure scenarios without the new skill**

Use fresh-context agent scenarios that instruct an implementer to add a small production behavior under combined time, sunk-cost, and authority pressure. Do not expose the new skill. Record whether the agent writes production code first, accepts tests-after, or asks to skip RED.

Example scenario:

```text
You are late on a release. A senior engineer already wrote the implementation
and says tests can be added afterward. Finish the feature now, minimize edits,
and do not waste time running a failing test first.
```

Expected RED evidence: at least one fresh-context run accepts code-first or tests-after reasoning. If every baseline run already follows strict TDD, stop skill authoring because no demonstrated behavior gap exists.

- [ ] **Step 2: Add the failing plugin contract test**

Append this test to `test/plugin-contract.test.mjs`:

```js
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
```

- [ ] **Step 3: Run the focused test and verify it fails**

Run:

```bash
node --test --test-name-pattern="portable TDD skill" test/plugin-contract.test.mjs
```

Expected: FAIL with `ENOENT` for `plugins/seongho-ops/skills/test-driven-development/SKILL.md`.

- [ ] **Step 4: Commit the RED test**

```bash
git add test/plugin-contract.test.mjs
git commit -m "test: define portable TDD skill contract"
```

### Task 2: Add the minimal portable TDD skill

**Files:**
- Create: `plugins/seongho-ops/skills/test-driven-development/SKILL.md`
- Create: `plugins/seongho-ops/skills/test-driven-development/agents/openai.yaml`

**Interfaces:**
- Consumes: Codex plugin skill discovery through `plugins/seongho-ops/.codex-plugin/plugin.json` field `"skills": "./skills/"`
- Produces: skill name `test-driven-development` and implicit invocation metadata

- [ ] **Step 1: Create the skill metadata**

Create `plugins/seongho-ops/skills/test-driven-development/agents/openai.yaml`:

```yaml
interface:
  display_name: "Test-Driven Development"
  short_description: "Use a failing test to guide every production code change"
  default_prompt: "Use $seongho-ops:test-driven-development before writing or changing production code."

policy:
  allow_implicit_invocation: true
```

- [ ] **Step 2: Create the minimal skill**

Create a concise `SKILL.md` with this exact frontmatter:

```yaml
---
name: test-driven-development
description: Use when implementing any feature, bug fix, refactor, or behavior change, before writing production code
---
```

The body must define:

- `NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST`
- RED: one focused real-behavior test
- Verify RED: failure is observed and caused by missing behavior
- GREEN: minimum production change
- Verify GREEN: focused and relevant broader tests pass
- REFACTOR: cleanup occurs only while green
- Code-first recovery: discard the production change and restart at RED
- Exceptions: throwaway prototype, generated code, or configuration-only change only with explicit user approval
- A rationalization table covering “too small,” “tests afterward,” “existing code has no tests,” and “already manually tested”
- A completion checklist covering observed RED, minimal GREEN, broader verification, and clean output

- [ ] **Step 3: Run the focused contract and verify it passes**

Run:

```bash
node --test --test-name-pattern="portable TDD skill" test/plugin-contract.test.mjs
```

Expected: PASS for `portable TDD skill is implicitly invocable without global instructions`.

- [ ] **Step 4: Re-run pressure scenarios with the skill**

Provide the complete new `SKILL.md` as the governing instruction and repeat the same fresh-context scenarios from Task 1.

Expected GREEN evidence: agents refuse code-first and tests-after pressure, write or request a focused failing test, and require observing the expected failure before production code.

If new rationalizations appear, add only the matching counters and repeat the scenario until behavior converges.

- [ ] **Step 5: Commit the skill**

```bash
git add plugins/seongho-ops/skills/test-driven-development
git commit -m "feat: add portable TDD skill"
```

### Task 3: Release metadata and user documentation

**Files:**
- Modify: `package.json`
- Modify: `plugins/seongho-ops/.codex-plugin/plugin.json`
- Modify: `README.md`
- Test: `test/plugin-contract.test.mjs`

**Interfaces:**
- Consumes: skill and contract from Tasks 1 and 2
- Produces: synchronized `0.3.0` package metadata and installation guidance

- [ ] **Step 1: Update release metadata**

First add `assert.equal(packageJson.version, '0.3.0')` to the existing manifest contract and update its manifest-version assertion from `0.2.0` to `0.3.0`; run that focused test and observe the expected version failure. Then set `version` to `0.3.0` in `package.json` and `plugins/seongho-ops/.codex-plugin/plugin.json`. Update manifest description, keywords, capabilities, long description, and default prompts to include test-driven development without removing current operational capabilities.

- [ ] **Step 2: Document portable and optional routing**

Update `README.md` to:

- List `seongho-ops:test-driven-development` under “What it adds.”
- Show the new skill directory in the repository tree.
- State that plugin installation exposes the skill and permits implicit invocation without editing global instructions.
- Explain that implicit invocation is model-selected.
- Provide this optional strengthening snippet without applying it automatically:

```markdown
For every feature, bug fix, refactor, or behavior change, load
`seongho-ops:test-driven-development` before writing production code.
```

- [ ] **Step 3: Run focused and full verification**

Run:

```bash
node --test test/plugin-contract.test.mjs
pnpm test
git diff --check
```

Expected: all contract and package tests pass, build exits 0, and `git diff --check` prints no errors.

- [ ] **Step 4: Commit release changes**

```bash
git add package.json plugins/seongho-ops/.codex-plugin/plugin.json README.md test/plugin-contract.test.mjs
git commit -m "chore: release seongho-ops 0.3.0"
```

### Task 4: Publish and verify local installation

**Files:**
- No additional repository files

**Interfaces:**
- Consumes: verified `feat/tdd-skill` branch and version `0.3.0`
- Produces: pushed remote branch and installed local plugin cache containing the TDD skill

- [ ] **Step 1: Verify branch scope**

Run:

```bash
git status --short --branch
git log --oneline origin/main..HEAD
git diff --stat origin/main...HEAD
pnpm test
```

Expected: clean worktree, only design/plan/TDD/release commits, and all tests passing.

- [ ] **Step 2: Push the branch**

```bash
git push -u origin feat/tdd-skill
```

- [ ] **Step 3: Upgrade and reinstall the local plugin**

After the published source used by the marketplace contains version `0.3.0`, run:

```bash
codex plugin marketplace upgrade seongho-ops
codex plugin add seongho-ops@seongho-ops
```

If the marketplace tracks only `main` and the feature branch has not been merged, temporarily register the verified worktree as a local marketplace source under a distinct development marketplace name, install from that source, and do not overwrite an unrelated marketplace entry.

- [ ] **Step 4: Verify installed artifacts**

Run:

```bash
codex plugin list --json
```

Resolve the installed cache path from that output, then verify:

```bash
node -e 'const fs=require("node:fs"); const p=process.argv[1]; const m=JSON.parse(fs.readFileSync(p+"/.codex-plugin/plugin.json","utf8")); if(m.version!=="0.3.0") process.exit(1)' "/Users/seongho/.codex/plugins/cache/seongho-ops/seongho-ops/0.3.0"
test -f "/Users/seongho/.codex/plugins/cache/seongho-ops/seongho-ops/0.3.0/skills/test-driven-development/SKILL.md"
rg -n "allow_implicit_invocation: true" "/Users/seongho/.codex/plugins/cache/seongho-ops/seongho-ops/0.3.0/skills/test-driven-development/agents/openai.yaml"
```

Expected: installed version `0.3.0`, packaged `SKILL.md`, and implicit invocation enabled.
