# Aside Browser

Use the selected Aside browser's existing tabs and login state. Preserve an explicitly requested browser, account, host, or CLI interface. GitHub repository, PR, review, and CI data work still follows the `gh` route unless the user requests browser UI interaction; the other service routes also remain in effect.

## Choose the interface

- Prefer Aside MCP's `repl` tool for tab inspection and browser interaction, especially a sequence of snapshots, form entries, and navigation. Its REPL context persists across calls in the same session.
- Use `aside` for installed guides, site skills, account/host management, version checks, authorized updates, shell scripts, and explicit CLI requests.
- If the MCP tool is unavailable or its connection fails, use `aside repl` against the same account, host, and target tab. State the connection issue and fallback. A stale element or page-state error calls for a fresh snapshot or attachment, not an automatic transport switch.
- MCP availability does not imply authorization to delegate. Both MCP `exec` and `aside exec` start work by Aside's own agent; use them only within the session's authorization for agent work.

## Read the installed guidance

When the CLI is available, discover its current interface:

```bash
command -v aside
aside --help
aside guide
```

Before using either REPL interface, read `aside guide repl`, check `aside skills list`, and read a matching site skill with `aside skills show <name>`. The installed CLI serves version-matched guidance; do not copy an old command catalog into this skill.

If the CLI is missing but MCP is connected, use the MCP tool's documented interface and any available site guidance. Report a missing required capability separately from authentication or connection failure; do not install or update software merely to inspect tabs.

## Inspect and control tabs

For a read-only inventory, send this JavaScript to MCP REPL or a CLI REPL:

```js
const openTabs = await listBrowserTabs();
console.log(openTabs.map(tab => ({ targetId: tab.targetId, active: tab.active, title: tab.title, url: tab.url })));
```

- Resolve an existing matching tab before opening another. Use `attachBrowserTab(targetId)` with an observed ID; use `attachActiveBrowserTab()` only for a request about the active page. Do not assume the initial `page` is the user's current tab.
- Read the attached page with `snapshot(page, { interactive: true })`. Follow its element references and refresh the snapshot after actions.
- Use the documented `openTab(url)` and `closeTab(tab)` helpers. Keep listing tasks read-only.
- Follow the installed guide for account/host selection. A missing tab on one account or host does not prove every Aside window is empty.

## Keep REPL state scoped to its session

MCP REPL and an interactive `aside repl` process can retain bindings within their own session. Use fresh variable names and reconnect after a session restart or transport switch.

A one-shot `aside repl "…"` closes its temporary REPL session afterward. Each invocation must resolve and attach its target tab in that same invocation before operating on it; a `page`, variable, or attachment from a previous command is not available. Inspect new state before choosing the next action. Verify temporary download paths within the command that produced them.

For a sequence of CLI actions, retain one interactive `aside repl` process or make each one-shot command self-contained. Do not repeatedly retry an action against a null `page`.

## Update the CLI only when authorized

An update notification or a companion skill's instruction to always update is not user authorization. Use the working installed version for ordinary browser tasks. If a missing feature requires an upgrade, explain the blocker and obtain authorization unless it already exists in the session.

When the user requests or has authorized an Aside CLI update:

```bash
aside --version
aside update --help
aside update
aside --version
```

Report the updater result and final CLI version. Already up to date, an installation prompt, and a completed installation are different outcomes. Refresh `aside guide` and the relevant mode help after a version change. Updating this routing plugin does not itself update the Aside executable.
