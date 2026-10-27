# Seongho Ops

`seongho-ops` combines code conventions, lightweight development-process guidance, Argo CD operations, Codex operational routing, protected Vercel preview access for the Codex in-app browser, and Seongho's personal `k` utility for force-stopping processes that own explicitly named local ports.

## What it adds

- `seongho-ops:write-korean`: writes Korean in the user’s voice, then selectively polishes awkward phrasing while preserving meaning, uncertainty, and the requested output format. Uses optional `write-like-me` style retrieval and bundled MIT-licensed polishing rules adapted from Humanize KR; a separate `humanize-korean` installation is not needed. Given-text polishing skips style retrieval.

- `seongho-ops:cli-routing`: selects purpose-built local CLIs for external services, authentication, infrastructure, databases, deployment, observability, browser QA, runtimes, AI coding tools, VS Code windows and terminals, and state-changing Git work; prefers Aside MCP REPL for Aside browser interaction and routes Jev/TypeSafe work to MCP, CLI, or SDK.
- `seongho-ops:argocd`: owns the durable Argo CD CLI guidance, including SSO recovery and exact Application capability probes that keep Kubernetes, project, and Application RBAC separate.
- `seongho-ops:1password`: reuses a task's authorized terminal session, groups required secret access, and avoids redundant sign-ins when using `op` or op-backed wrappers. CLI routing loads this skill before access; 1Password's own authorization expiry still applies.
- `seongho-ops:vercel-preview-browser`: uses the authenticated Vercel CLI to obtain a deployment-protection cookie and injects it into the Codex in-app browser through its permitted CDP capability.
- `seongho-ops:brainstorming`: resolves material design uncertainty before implementation while letting clear, reversible work proceed without a mandatory spec.
- `seongho-ops:verification-before-completion`: requires fresh, claim-sized evidence before completion reports, commits, pushes, pull requests, handoffs, or moving to the next task.
- `seongho-ops:systematic-debugging`: reproduces and traces failures, tests one falsifiable cause, and verifies the original symptom before accepting a fix.
- `seongho-ops:test-driven-development`: requires a failing test before production code for features, bug fixes, refactors, and behavior changes.
- `seongho-ops:code-convention`: consolidates TypeScript/React naming, type safety, declarative code, component/Hook refactoring, and anti-pattern guidance. It prefers the project design system; when none exists, it uses a shared shadcn/ui layer with consistent tokens, variants, and accessible headless primitives. Review-only requests remain read-only.
- `seongho-ops:performance-engineering`: activates only for explicit performance work; it requires comparable end-to-end measurement, read-only frontend/backend/database triage, authorized mutation scope, and one measured bottleneck per cycle without default cache, index, or concurrency choices.
- `k <port> [port...]`: finds listeners with `lsof` and sends `SIGKILL` to each matching process.
- Lazy routing and authentication references so the entry skill stays focused.

The Vercel helper keeps the bypass value inside the local Node/browser runtime. It never returns the cookie to the model, never puts the bypass secret in a URL, and removes its temporary cookie jar after injection. Application login is a separate step and remains in the in-app browser's own persistent session.

The previous `c` command is intentionally not part of this project.

Aside browser tasks use MCP REPL by default. The Aside CLI provides guides, account/host management, shell scripting, explicit CLI operation, and a fallback when MCP is unavailable. A one-shot `aside repl "…"` closes its temporary session, so each invocation must reconnect to its target tab; a persistent MCP or interactive CLI REPL can retain bindings. CLI updates require an explicit request or existing authorization, even when another skill recommends automatic updates. This plugin supplies routing guidance; it does not install or configure Aside MCP.

Jev tasks load the official `typesafe-ai` skill before question design. One-off judgments use the connected `jev` MCP; shell scripts, batches, and account diagnostics use the `jev` CLI; repeatable application features use the official TypeSafe SDK. See the [Jev routing reference](plugins/seongho-ops/skills/cli-routing/references/jev.md).

Google Workspace tasks prefer `gog`, the `gogcli` executable, for Gmail and other supported services. The route covers account selection, authentication checks, and draft versus send workflows while preserving an explicitly requested tool such as `gws`. See the [Google Workspace routing reference](plugins/seongho-ops/skills/cli-routing/references/google-workspace.md). The plugin provides guidance; install and authenticate `gogcli` separately.

VS Code tasks use the built-in `code` CLI for files, windows, and extensions, and the separately installed `vscode-terminal` bridge for integrated terminal discovery, execution, output, and lifecycle control. See the [VS Code routing reference](plugins/seongho-ops/skills/cli-routing/references/vscode.md). This plugin supplies guidance; it does not bundle or automatically install the bridge.

## Korean writing

Use `$seongho-ops:write-korean` for Korean drafting in your voice or for polishing a supplied draft. Automatic selection remains model-driven; this skill is not a hook that intercepts every `write-like-me` invocation.

Style matching can use the separately installed OpenAI Writing Style (`write-like-me`) plugin and its connected app when examples are needed; provided examples and draft-only editing do not require it. Polishing uses the bundled `references/korean-polishing.md`, adapted from `epoko77-ai/im-not-ai` v2.3.2 under MIT. The original `humanize-korean` skill is not a runtime dependency. See the packaged [attribution and modifications](plugins/seongho-ops/skills/write-korean/NOTICE.md) and [upstream MIT license](plugins/seongho-ops/skills/write-korean/LICENSE). No OpenAI source is bundled. It returns the finished text in the requested destination, without mandatory diagnostic files or grades.

For consistent pairing, optionally add this instruction to your own `AGENTS.md`:

```markdown
한국어 글에 write-like-me를 적용할 때 seongho-ops:write-korean도 읽고,
그 조합 스킬의 문체 보존·선별 윤문·출력 절차를 따른다.
```

## Repository layout

```text
.agents/plugins/marketplace.json
plugins/seongho-ops/
  .codex-plugin/plugin.json
  bin/k.js
  runtime/vercel-preview-iab.js
  skills/write-korean/
    SKILL.md
    agents/openai.yaml
    references/korean-polishing.md
    NOTICE.md
    LICENSE
  skills/cli-routing/
    SKILL.md
    agents/openai.yaml
    references/routes.md
    references/vscode.md
    references/google-workspace.md
    references/aside.md
    references/jev.md
    references/auth-recovery.md
    scripts/k
  skills/argocd/
    SKILL.md
    agents/openai.yaml
  skills/1password/
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
  skills/code-convention/
    SKILL.md
    agents/openai.yaml
    references/typescript.md
    references/react.md
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

For plugin maintenance, follow [AGENTS.md](AGENTS.md). Keep the normal installation on the published Git marketplace, edit only source worktrees, and refresh/reinstall after publishing. Verify both the version and the complete packaged file contents. Do not edit installed caches or replace the normal marketplace with a development checkout; explicitly requested local experiments need an isolated installation.

The packaged `plugins/seongho-ops/skills/argocd/` directory is the source of truth for Argo CD guidance. Any standalone copy under `~/.agents/skills/argocd/` is a legacy installed copy, not a durable source-edit target.

## Safety

`k` is intentionally forceful: it sends signal 9 and does not allow the target process to clean up. Use it only for explicitly supplied local ports and prefer a graceful application-specific stop when practical.
