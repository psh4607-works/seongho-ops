# Seongho Ops

`seongho-ops` combines lightweight development-process guidance, Argo CD operations, Codex operational routing, protected Vercel preview access for the Codex in-app browser, and Seongho's personal `k` utility for force-stopping processes that own explicitly named local ports.

## What it adds

- `seongho-ops:cli-routing`: selects purpose-built local CLIs for external services, authentication, infrastructure, databases, deployment, observability, browser QA, runtimes, AI coding tools, and state-changing Git work.
- `seongho-ops:argocd`: owns the durable Argo CD CLI guidance, including SSO recovery and exact Application capability probes that keep Kubernetes, project, and Application RBAC separate.
- `seongho-ops:vercel-preview-browser`: uses the authenticated Vercel CLI to obtain a deployment-protection cookie and injects it into the Codex in-app browser through its permitted CDP capability.
- `seongho-ops:brainstorming`: resolves material design uncertainty before implementation while letting clear, reversible work proceed without a mandatory spec.
- `seongho-ops:verification-before-completion`: requires fresh, claim-sized evidence before completion reports, commits, pushes, pull requests, handoffs, or moving to the next task.
- `seongho-ops:systematic-debugging`: reproduces and traces failures, tests one falsifiable cause, and verifies the original symptom before accepting a fix.
- `seongho-ops:test-driven-development`: requires a failing test before production code for features, bug fixes, refactors, and behavior changes.
- `seongho-ops:performance-engineering`: activates only for explicit performance work; it requires comparable end-to-end measurement, read-only frontend/backend/database triage, authorized mutation scope, and one measured bottleneck per cycle without default cache, index, or concurrency choices.
- `k <port> [port...]`: finds listeners with `lsof` and sends `SIGKILL` to each matching process.
- Lazy routing and authentication references so the entry skill stays focused.

The Vercel helper keeps the bypass value inside the local Node/browser runtime. It never returns the cookie to the model, never puts the bypass secret in a URL, and removes its temporary cookie jar after injection. Application login is a separate step and remains in the in-app browser's own persistent session.

The previous `c` command is intentionally not part of this project.

## Repository layout

```text
.agents/plugins/marketplace.json
plugins/seongho-ops/
  .codex-plugin/plugin.json
  bin/k.js
  runtime/vercel-preview-iab.js
  skills/cli-routing/
    SKILL.md
    agents/openai.yaml
    references/routes.md
    references/auth-recovery.md
    scripts/k
  skills/argocd/
    SKILL.md
    agents/openai.yaml
  skills/vercel-preview-browser/
    SKILL.md
    agents/openai.yaml
  skills/brainstorming/
    SKILL.md
    agents/openai.yaml
  skills/verification-before-completion/
    SKILL.md
    agents/openai.yaml
  skills/systematic-debugging/
    SKILL.md
    agents/openai.yaml
  skills/test-driven-development/
    SKILL.md
    agents/openai.yaml
  skills/performance-engineering/
    SKILL.md
    agents/openai.yaml
    references/measurement.md
    references/frontend.md
    references/backend.md
    references/database.md
src/commands/k.ts
src/runtime/vercel-preview-iab.ts
test/
```

The TypeScript build emits a self-contained `plugins/seongho-ops/bin/k.js` and an importable `plugins/seongho-ops/runtime/vercel-preview-iab.js`. Keeping both artifacts inside the plugin root makes them available from the installed plugin cache.

## Development

```bash
pnpm install
pnpm test
```

Link the `k` command locally:

```bash
pnpm link --global
```

## Install

```bash
codex plugin marketplace add psh4607/seongho-ops --ref main
codex plugin add seongho-ops@seongho-ops
```

Start a new Codex task after installation so the new skill catalog is loaded.

The installed TDD skill permits implicit invocation, so normal use does not require the installer to edit a global or repository `AGENTS.md`. Invocation remains model-selected rather than an operating-system hook; repository tests and CI remain the enforceable backstop for test results.

### Optional stronger TDD routing

Users who want an explicit local instruction can add this to their own `AGENTS.md`:

```markdown
For every feature, bug fix, refactor, or behavior change, load
`seongho-ops:test-driven-development` before writing production code.
```

This is optional and is never written automatically by the plugin.

For local plugin development, register this checkout instead:

```bash
codex plugin marketplace add /Users/seongho/projects/seongho/plugins/seongho-ops
codex plugin add seongho-ops@seongho-ops
```

The packaged `plugins/seongho-ops/skills/argocd/` directory is the source of truth for Argo CD guidance. Any standalone copy under `~/.agents/skills/argocd/` is a legacy installed copy, not a durable source-edit target.

## Safety

`k` is intentionally forceful: it sends signal 9 and does not allow the target process to clean up. Use it only for explicitly supplied local ports and prefer a graceful application-specific stop when practical.
