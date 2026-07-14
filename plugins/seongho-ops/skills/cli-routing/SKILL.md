---
name: cli-routing
description: Use before CLI work involving external services, auth, infrastructure, databases, deployment, observability, secrets, containers, browser QA, package/runtime management, AI coding tools, remote Git, state-changing Git, or the bundled k port cleanup command. Skip ordinary read-only local inspection. Load narrower matching skills afterward. Datadog and Sentry are CLI-only.
---

# CLI Routing

Route operational work to the correct local CLI without taxing ordinary local inspection.

## Scope

Load this skill before selecting, running, explaining, troubleshooting, authenticating, installing, or upgrading an in-scope CLI. Skip it for reading files; `pwd`, `ls`, `rg`, `rg --files`, read-only `find`/`sed`/`awk`/`jq`, `wc`, `stat`; and `git status`, `git diff`, `git log`, `git show`, or `git branch --show-current`.

If an exempt investigation expands into service-facing, remote, package/runtime, or state-changing work, load this skill before continuing.

## Required flow

1. Classify the operation before choosing a command.
2. For service-facing CLI work, read `references/routes.md` completely and follow its hard routes.
3. Load narrower matching skills afterward, especially `argocd` and `supabase`.
4. Use `command -v` and the narrowest `--help` when the installed command or syntax has not been proven in the current turn.
5. Diagnose read-only first, execute only the requested scope, and verify mutations when practical.
6. For genuine missing or expired auth, read `references/auth-recovery.md` completely before login, OAuth, device-code, SSO, or browser-assisted recovery.

Use purpose-built connectors and service skills for Slack, Linear, Figma, and ordinary Notion work unless the user requests a CLI.

## Bundled utility

The plugin bundles `k`, a personal convenience command that sends `SIGKILL` to every process listening on each explicitly supplied local port:

```bash
k <port> [port...]
```

- Run `k` only when the user explicitly asks to stop a process or free the named port.
- Do not infer ports or use it as a generic cleanup step.
- Prefer a graceful shutdown when the owning process is known and the user did not specifically ask for a force kill.
- When `k` is not installed on `PATH`, resolve this skill's plugin root and run `node <plugin-root>/bin/k.js <port...>`.

## Failure and safety

- Distinguish auth, RBAC, rate limit, network, wrong target/profile, and capability failures.
- Prefer filtered structured output. Never print tokens, cookies, passwords, private keys, or complete credentials.
- Do not loop login or refresh attempts.
- Name prod versus exp/staging before mutations.
- Do not install, upgrade, force, or perform destructive or bulk writes unless authorized.
- Report the material route and target, verification, and remaining blocker.
