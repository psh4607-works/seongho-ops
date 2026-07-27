# Portable TDD Skill Design

## Goal

Add a portable `seongho-ops:test-driven-development` skill that is discoverable after plugin installation and guides every feature, bug fix, refactor, and behavior change through test-first development without requiring a user's global `AGENTS.md` to be modified.

## Architecture

The plugin will package one self-contained discipline skill under `plugins/seongho-ops/skills/test-driven-development/`. Its trigger-focused frontmatter and `agents/openai.yaml` metadata will allow implicit invocation whenever a task will create or modify production code.

The skill will enforce the RED-GREEN-REFACTOR sequence:

1. Write one test for the next behavior.
2. Run it and confirm it fails for the expected missing-behavior reason.
3. Write the minimum production code needed to pass.
4. Run the focused and relevant broader tests.
5. Refactor only while tests remain green.

If production code is written before a failing test, the skill requires discarding that production change and restarting from RED. Exceptions are limited to throwaway prototypes, generated code, and configuration-only changes, and require explicit user approval.

## Portable Invocation

The installed plugin is the source of truth:

- The skill description covers features, bug fixes, refactoring, behavior changes, and production code modification.
- `agents/openai.yaml` sets `policy.allow_implicit_invocation: true`.
- The plugin manifest already exposes the complete `skills/` directory.

No installer or runtime helper will edit `~/.codex/AGENTS.md`, `~/.agents/AGENTS.md`, repository instructions, or other user-owned configuration. The README may include an optional instruction snippet for users who want stronger local routing, but installation and normal use must not depend on it.

Implicit invocation is model-selected rather than an operating-system hook. The plugin will therefore optimize discovery and verify its metadata contract, while documenting that repository tests and CI remain the enforceable backstop for test results.

## Skill Content

The skill will be concise and self-contained. It will include:

- The test-first iron law.
- A scannable RED-GREEN-REFACTOR workflow.
- Focused test requirements and verification checkpoints.
- Explicit responses to common rationalizations.
- Stop conditions for code-first or test-after behavior.
- A completion checklist.

It will adapt the proven Superpowers TDD discipline without depending on the Superpowers plugin at runtime.

## Testing

Skill authoring follows documentation TDD:

1. Run pressure scenarios without the new skill and record code-first or test-after baseline behavior.
2. Add a failing plugin contract test for the new packaged skill, metadata, invocation policy, and version.
3. Add the minimum skill files and version changes needed to pass.
4. Re-run pressure scenarios with the skill and verify agents remain test-first under combined time, sunk-cost, and authority pressure.
5. Close only rationalization gaps observed during testing.
6. Run the complete package test suite.

## Packaging and Release

The package and plugin manifest versions will move from `0.2.0` to `0.3.0`, reflecting a backward-compatible feature addition. README structure and capabilities will mention portable TDD guidance.

After verification, the branch will be committed and pushed. The local marketplace snapshot will be upgraded, `seongho-ops@seongho-ops` will be reinstalled, and the installed cache will be checked for version `0.3.0`, the new skill, and implicit invocation metadata.

## Non-Goals

- Mutating global or repository `AGENTS.md` files during installation.
- Adding a background daemon, pre-commit hook, or test framework integration.
- Proving test-first chronology in CI.
- Replacing repository-specific test commands or quality gates.
