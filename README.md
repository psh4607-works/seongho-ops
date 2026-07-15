# Seongho Ops

`seongho-ops` combines Codex operational routing, protected Vercel preview access for the Codex in-app browser, and Seongho's personal `k` utility for force-stopping processes that own explicitly named local ports.

## What it adds

- `seongho-ops:cli-routing`: selects purpose-built local CLIs for external services, authentication, infrastructure, databases, deployment, observability, browser QA, runtimes, AI coding tools, and state-changing Git work.
- `seongho-ops:vercel-preview-browser`: uses the authenticated Vercel CLI to obtain a deployment-protection cookie and injects it into the Codex in-app browser through its permitted CDP capability.
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
  skills/vercel-preview-browser/
    SKILL.md
    agents/openai.yaml
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

For local plugin development, register this checkout instead:

```bash
codex plugin marketplace add /Users/seongho/projects/seongho/plugins/seongho-ops
codex plugin add seongho-ops@seongho-ops
```

## Safety

`k` is intentionally forceful: it sends signal 9 and does not allow the target process to clean up. Use it only for explicitly supplied local ports and prefer a graceful application-specific stop when practical.
