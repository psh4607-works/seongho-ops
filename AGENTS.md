# Seongho Ops maintenance

These instructions apply when maintaining this plugin, not whenever one of its skills is used for an unrelated task.

## Source and installation boundaries

- The published source of truth is `https://github.com/psh4607/seongho-ops.git`, branch `main`. The normal installation is `seongho-ops@seongho-ops` from that Git marketplace.
- Edit the source checkout or an isolated linked worktree. Never directly edit installed files under `~/.codex/plugins/cache/seongho-ops/`, marketplace snapshots under `~/.codex/.tmp/marketplaces/seongho-ops/`, or create a standalone skill copy to override the packaged skill.
- The marketplace entry's `source: local` means a path inside its repository snapshot. Verify the installation's `marketplaceSource` is the Git repository above; do not confuse these two fields.
- Keep the normal installation on the published release. Do not install an unpublished branch, local cachebuster, or local marketplace over it. Explicitly requested development installations must be isolated and identified as temporary.

## Check synchronization at the start

1. Read Git status, branch, worktrees, and origin. Preserve unrelated changes and use a worktree for edits.
2. Fetch origin and inspect the current `origin/main`; do not call a stale local tracking branch the latest remote state.
3. Inspect `codex plugin list --marketplace seongho-ops --json` and the marketplace snapshot. Compare the published manifest version, installed version, and packaged file contents. A matching version string alone is insufficient.
4. If the published source is newer, refresh and reinstall using the sequence below. If the installed version is ahead or its contents differ, first preserve any unique changes as a patch or copy outside the managed caches and identify their source. Port intended changes into a source worktree; do not publish unknown cache contents automatically or erase them to make versions match.
5. If offline, authentication fails, a deliberate version pin exists, or concurrent unpublished work makes reconciliation unsafe, report the exact mismatch and preserve the work. Do not force-reset, force-push, downgrade, or claim synchronization without evidence.

## Finish publication and local installation together

For an authorized release, complete the remote publication and update this Mac's normal installation in the same task. Do not report a remote-only release or local-only installation as complete. Respect an explicit read-only, local-only, no-push, or no-merge instruction; keep such work isolated and report the remaining synchronization step.

1. Validate the scoped change. For executable changes, run the relevant tests and `pnpm test`; for skill/package changes, also validate the skill and plugin structure. Documentation-only changes need a diff/consistency review, not wording-matching tests.
2. When packaged files change, advance the release version consistently in `package.json`, `plugins/seongho-ops/.codex-plugin/plugin.json`, and existing version assertions. Do not reuse a released version for different packaged contents. Root documentation-only changes do not require a plugin version bump.
3. Follow the GitHub publishing skills, preserve hooks and attribution policy, and publish the reviewed change to `main` within the user's authorization. Surface material conflicts instead of resolving them silently. Verify the final remote commit and relevant checks.
4. Refresh the Git marketplace, then install from it:

   ```bash
   codex plugin marketplace upgrade seongho-ops --json
   codex plugin add seongho-ops@seongho-ops --json
   codex plugin list --marketplace seongho-ops --json
   ```

5. Fast-forward the normal source checkout only when it is clean and on `main`. Leave unrelated branches and dirty checkouts intact. Verify the marketplace snapshot represents the published commit; derive its path and the installed path from CLI output rather than hardcoding a version directory.
6. Compare the complete packaged file set and file bytes among the published source, marketplace snapshot, and installed plugin. Detect missing or extra files as well as modified files. Confirm the manifest version and intended enabled state. If `main` advanced during the task, reconcile with that revision before claiming the installation is current.
7. Report the published commit/PR, installed version, content-match result, and any remaining blocker. New Codex conversations pick up the new catalog; reinstalling does not prove existing conversations reloaded it.

This is a task-time maintenance policy, not a background updater. It authorizes neither unrelated CLI upgrades nor changes to other plugin installations.
