# Seongho Ops

`seongho-ops` combines a Codex operational CLI-routing skill with Seongho's personal `k` utility for force-stopping processes that own explicitly named local ports.

## What it adds

- `seongho-ops:cli-routing`: selects purpose-built local CLIs for external services, authentication, infrastructure, databases, deployment, observability, browser QA, runtimes, AI coding tools, and state-changing Git work.
- `k <port> [port...]`: finds listeners with `lsof` and sends `SIGKILL` to each matching process.
- Lazy routing and authentication references so the entry skill stays focused.

The previous `c` command is intentionally not part of this project.

## Repository layout

```text
.agents/plugins/marketplace.json
plugins/seongho-ops/
  .codex-plugin/plugin.json
  bin/k.js
  skills/cli-routing/
    SKILL.md
    agents/openai.yaml
    references/routes.md
    references/auth-recovery.md
    scripts/k
src/commands/k.ts
test/
```

The TypeScript build emits a self-contained `plugins/seongho-ops/bin/k.js`. Keeping the built command inside the plugin root makes it available from the installed plugin cache as well as through a global package link.

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

For local plugin development, register this checkout instead:

```bash
codex plugin marketplace add /Users/seongho/projects/seongho/plugins/seongho-ops
codex plugin add seongho-ops@seongho-ops
```

## Safety

`k` is intentionally forceful: it sends signal 9 and does not allow the target process to clean up. Use it only for explicitly supplied local ports and prefer a graceful application-specific stop when practical.
