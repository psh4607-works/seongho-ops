---
name: 1password
description: Use when accessing secrets with the 1Password op CLI, running op-backed wrappers, or reducing repeated 1Password CLI biometric prompts. Reuse the authorized terminal session and batch required secret access.
---

# 1Password CLI

Minimize repeated approvals by preserving the terminal session and reducing secret retrieval. This skill guides execution; it does not change 1Password authorization settings.

## Before access

- Follow `seongho-ops:cli-routing`. Check `command -v op`, `op --version`, and relevant `--help` without fetching secrets.
- Reuse the target service's existing authenticated CLI session when it already satisfies the task. Do not fetch credentials merely because they exist in 1Password.
- Identify the intended account and required items from task context. Keep non-secret references for reuse; do not repeatedly enumerate vaults or fetch whole items to rediscover known fields.
- Do not prepend `op signin`, `op whoami`, or a vault listing to every operation. An actual required operation can establish whether access works; a status probe may itself prompt.
- Preserve an existing authorized service-account or Connect configuration. Do not print its variables, replace its authentication mode, or silently fall back to a different account.

## Keep one terminal session

On macOS/Linux, desktop integration authorizes a terminal session and its subshells. A fresh terminal for each tool call can cause repeated approvals.

1. Reuse a known live terminal belonging to this task. Otherwise create one persistent interactive PTY shell for the bounded operation. With `exec_command`, use `tty: true`, `login: false`, and `cmd: "/bin/zsh -f"` on macOS; retain the returned `session_id`.
2. Send subsequent commands through `write_stdin` to that same running shell. A new `exec_command` with `tty: true` for every command still creates new sessions. A command that exits immediately does not preserve a shell.
3. Before secret-bearing work, disable shell tracing and history in this shell (`set +x`, `unset HISTFILE`, `HISTSIZE=0`, `SAVEHIST=0`). Never send literal secrets as terminal input; commands should contain only references or variable names.
4. Run the needed operation once. If biometric approval is pending, keep that process alive and let the user complete the native prompt. Poll the existing process; do not start concurrent authentication attempts.
5. Run follow-up operations in the same session. Inspect completion and exit status before sending dependent commands. If the session has ended, acknowledge that a new one can need approval.
6. Exit the task-owned shell when the work is finished. Do not close a pre-existing user terminal.

For Orca-managed terminals, use `orca-cli` to discover and reuse the exact task terminal ID and its supported execution API. Do not create a new terminal per `op` call or type into a terminal running unrelated work. An `orca-terminal-host` label identifies the requesting host, not proof that successive commands share a session.

When persistent terminals are unavailable, combine already-known operations into one bounded script invocation. Do not invent a background credential broker or share an authenticated terminal across unrelated agents.

## Retrieve only what the task needs

Prefer one `op run` around a trusted, bounded task script, with a reference-only environment file:

```sh
op run --env-file="./task.secrets.env" -- ./task-command
```

The environment file contains `op://...` references, never resolved credentials. Inspect the task script's logging before execution. Use the current `op run --help` for supported flags; online documentation can describe features absent from the installed version.

Use `op read` or narrowly selected item fields when the consumer cannot use `op run`; consume their output inside the process or through a pipe, rather than returning it to chat. Group required reads and reuse values only for the bounded operation. Keep default output masking enabled, but do not rely on masking to make secret logging safe.

Do not persist resolved secrets or session tokens in skill files, shell startup files, temporary files, transcripts, or memory. Do not print environment dumps or full item JSON. Existing explicitly authorized credential-storage workflows remain governed by their own scope.

## Expiry and recovery

- Desktop CLI authorization is per account. Official limits are 10 minutes of inactivity and a 12-hour maximum; app locking revokes prior authorization. A skill cannot promise permanent or cross-terminal approval.
- Do not schedule keepalive reads, disable app locking, automate native approval, or export a session token to defeat these boundaries.
- On cancellation or denial, stop that access attempt. On a genuine expired session, follow the router's auth-recovery reference and allow one renewed authorization in the same terminal. Distinguish wrong account, RBAC, network, and app-integration failures from expiration.
- For explicitly requested unattended operation, consider a scoped service account. Confirm the intended vaults and permissions before provisioning; use the approved secret-delivery mechanism for its token. Do not silently create a service account or request its token in chat.

## Verification

Keep these claims separate: same terminal reused, required operation succeeded, and fewer prompts observed. Non-secret `tty` and shell PID checks can verify continuity, but cannot establish biometric reuse. Only report reduced prompts after observing actual authorized operations or obtaining user confirmation; avoid prompting merely to test this skill.

Official references: [authorization model](https://www.1password.dev/cli/app-integration-security), [op run](https://www.1password.dev/cli/secrets-environment-variables), [service accounts](https://www.1password.dev/service-accounts).
