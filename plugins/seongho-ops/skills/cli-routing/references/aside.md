# Aside CLI

Use `aside` for an explicitly requested Aside browser task or CLI update. Use the selected browser's existing tabs and login state; do not substitute Chrome or the Codex in-app browser. GitHub repository, PR, review, and CI data work still follows the `gh` route unless the user requests browser UI interaction.

## Discover the installed interface

```bash
command -v aside
aside --help
aside guide
```

The installed CLI serves its version-matched guide. Read it before choosing a mode; do not copy an old command catalog into this skill. If the executable is missing, report that separately from an authentication or browser connection failure.

## Inspect and control tabs directly

Read `aside guide repl` before using `aside repl`. Check `aside skills list` and read a matching site skill with `aside skills show <name>` before interacting with that service.

For an open-tab inventory, the REPL guide provides a read-only call that does not attach to or open a tab:

```bash
aside repl 'const openTabs = await listBrowserTabs(); console.log(openTabs.map(tab => ({ targetId: tab.targetId, active: tab.active, title: tab.title, url: tab.url })));'
```

- Resolve an existing matching tab before opening another. Use `attachBrowserTab(targetId)` with an observed ID; use `attachActiveBrowserTab()` only for a request about the active page. Do not assume the initial `page` is the user's current tab.
- Read the attached page with `snapshot(page, { interactive: true })`. Follow the guide's element references and refresh the snapshot after actions.
- Use the documented `openTab(url)` and `closeTab(tab)` helpers for tab management. Keep listing tasks read-only.
- Follow the installed guide for persistent REPL bindings and account/host selection. A missing tab on one account or host does not prove every Aside window is empty.

## Delegate a browsing task

`aside exec` starts a task handled by Aside's own agent. It is a delegation, while `aside repl` lets the current agent inspect and operate the browser directly. Use delegation only within the session's authorization for agent work, and follow the guide's session status, steering, and completion workflow. A simple tab inventory can use the direct REPL call above.

## Update the CLI

When the user requests or has authorized an Aside CLI update:

```bash
aside --version
aside update --help
aside update
aside --version
```

Report the updater result and final CLI version. If it says the current version is already up to date, report that without claiming a new version was installed. Refresh `aside guide` and the relevant mode help after a version change before relying on old commands. Updating this routing plugin does not itself update the Aside executable; run its updater separately when requested. Routine browser use does not imply permission to upgrade it.
