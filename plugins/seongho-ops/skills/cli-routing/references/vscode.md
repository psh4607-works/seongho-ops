# VS Code CLI and Terminal Bridge

Read this reference when operating VS Code itself or its integrated terminals. Prefer these programmatic interfaces to desktop clicks. This route does not replace `orca-cli` for Orca-managed terminals or authorize unrelated editor configuration changes.

## Choose the interface

| Task | Interface |
| --- | --- |
| Open a project/file, select a line, compare files, choose a window/profile | Built-in `code` CLI |
| Inspect or manage VS Code extensions; diagnose editor processes | Built-in `code` CLI |
| List/count terminal sessions, create a terminal, run commands, read captured output, send input, interrupt or close | `vscode-terminal` CLI → local socket → Terminal Bridge extension → Terminal API |
| Inspect a terminal that predates bridge observation | List its name, shell PID, cwd, and reported activity; past output and current command may be unavailable |

Check `command -v code vscode-terminal` and the relevant `--help` before using unfamiliar options. `code --status` is editor process diagnostics, not a terminal session list or command-output reader. Do not invent `code terminal ...` or `code --command` operations.

## Built-in CLI

Use only the operation needed for the request:

```bash
code /absolute/project
code --new-window /absolute/project
code --reuse-window /absolute/project/file.ts
code --goto /absolute/project/file.ts:42:5
code --diff /absolute/before.ts /absolute/after.ts
code --list-extensions --show-versions
code --status
```

`--reuse-window` targets an existing window, not a bridge window ID; avoid it when changing an unrelated active window would be disruptive. Use `--profile NAME` when a particular profile is intended. `--wait` waits for opened files to close, not for a terminal command to finish. Extension installation/removal (`--install-extension`, `--uninstall-extension`) changes the selected installation/profile and must stay within the authorized task. Neither a successful launch nor an installed extension proves the bridge is active in a given window.

## Terminal discovery and read-only inspection

```bash
vscode-terminal windows
vscode-terminal --window WINDOW_ID list
```

- `windows` returns live bridge instances with their IDs and workspace folders. It is not an inventory of every VS Code window; untrusted workspaces or windows without the active extension may be absent.
- Match the workspace to the user's task, then reuse that window ID. One instance can be selected automatically; multiple instances require `--window`. Do not pick an arbitrary first window.
- `list` returns an array of terminals. Count that array for “how many sessions,” and report names when useful. This is terminal-session count, not child-process or AI-conversation count.
- Each terminal has `id`, `name`, `pid` (shell PID), `cwd`, `state`, `shellIntegration`, and `activeExecutionIds`. Use IDs, not names or PIDs, to target actions. `unknown` does not mean idle or failed. Do not execute a probe or send input merely to determine whether an existing terminal is busy.
- For observed active execution IDs, use `status` and `read` below. An empty `activeExecutionIds` on an `unknown` terminal is not proof that no program is running.

## Create, execute, and read

```bash
vscode-terminal --window WINDOW_ID create --name 'AI task' --cwd /absolute/project --clean-shell
vscode-terminal --window WINDOW_ID list
vscode-terminal --window WINDOW_ID execute TERMINAL_ID --command 'pwd'
vscode-terminal --window WINDOW_ID status EXECUTION_ID
vscode-terminal --window WINDOW_ID read EXECUTION_ID --cursor 0 --limit 16000
```

The create response's `id` is the terminal ID; the execute response's `id` is the execution ID. Wait with a bounded timeout for `shellIntegration:true` and `state:idle` before executing in a new terminal. Do not replace unavailable shell integration with untracked `send` execution.

On this Mac, new AI-owned terminals were verified with `--clean-shell`: it starts `/bin/zsh` with an isolated `ZDOTDIR` because user startup configuration interfered with execution tracking. It preserves the VS Code process environment but skips user shell startup files, aliases, functions, and their additional configuration. Prefer it for independent AI commands here; omit it when the task depends on the normal shell setup, and investigate missing events without silently changing that setup. This is a local workaround, not a universal requirement for every machine or shell.

Quote `--command` as one argument, or use a subprocess argument array. Execution acceptance is not command success. Poll `status`/`read`; `status:ended` and `exitCode:0` establish successful completion. `exitCode:null` is unknown. Output may finish later: wait for `outputComplete:true` and drain until `nextCursor == nextOffset`. Check `captureError` before claiming complete output.

Pass each read's `nextCursor` to the next `--cursor`; do not substitute `nextOffset` before draining a paginated response. Cursors use UTF-16 code units, not bytes. `truncated:true` means older output has been discarded. Output contains raw ANSI sequences and is not a rendered TUI screenshot. Pre-observation scrollback is unavailable; IDs and retained output reset when the extension restarts. `EXECUTION_NOT_FOUND` can mean an old execution was evicted, not that its process ended.

## Input and lifecycle

```bash
vscode-terminal --window WINDOW_ID send TERMINAL_ID --text 'yes' --enter
vscode-terminal --window WINDOW_ID interrupt TERMINAL_ID
vscode-terminal --window WINDOW_ID close TERMINAL_ID
```

`send` writes to the current program; `--enter` adds Enter. It does not guarantee tracked execution. `interrupt` sends Ctrl+C and `close` disposes the terminal; verify the intended result afterward. Use these mutations only within the user's task scope, and clean up only test terminals created for the task.

`execute` rejects busy or unknown terminals by default. `--allow-interrupt` can stop existing work and is appropriate only when interruption is intended and authorized, never as a workaround for read-only inspection. On a CLI timeout or lost response, inspect the terminal and known execution IDs before retrying: the first command may already have started.

## Availability and recovery

- The separately installed extension is `seongho.vscode-terminal-bridge`. This plugin packages routing guidance, not that extension or CLI. On this Mac its source and usage guide are at `~/projects/seongho/vscode-terminal-bridge/README.md`; verify the path exists before using it. A known built checkout can also run `node /verified/project/dist/cli.js ...` when only the CLI PATH entry is missing.
- For `NO_WINDOW`, check `code --list-extensions --show-versions`, the intended VS Code profile, workspace trust, and extension activation. The command palette's `Terminal Bridge: Show Connection` identifies the instance. Do not reload an active window or install/upgrade extensions merely to answer a read-only count question; report unavailable coverage when necessary.
- Default local connection directory: `~/.vscode-terminal-bridge` (0700); socket and discovery files are 0600. Do not weaken permissions or replace symlink checks. If VS Code was launched with `VSCODE_TERMINAL_BRIDGE_DIR`, give the CLI the same `--directory PATH`. Long Unix socket paths require a shorter private directory, not public network exposure.
- Verified scope: local macOS VS Code with zsh. Linux, Windows, VS Code Web, Remote SSH and containers are not verified by this local result; check the bridge's current documentation before assuming support.

Official references: [VS Code CLI](https://code.visualstudio.com/docs/configure/command-line), [Terminal API](https://code.visualstudio.com/api/references/vscode-api#TerminalShellExecution).
