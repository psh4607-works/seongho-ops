---
name: argocd
description: Use when working with Argo CD or the argocd CLI, especially app inspection, mutation, sync, deploy verification, Kubernetes handoff, SSO recovery, or RBAC capability diagnosis.
---

# Argo CD

## Target Configuration

Resolve `<ARGOCD_SERVER>`, `<PROJECT>`, and `<APP_NAME>` from explicit task context first. When a required target value is missing, read the corresponding `argocd.server`, `argocd.project`, or `argocd.appName` field from the local `~/.config/seongho-ops/private-config.json`. Use its project and application values only for its configured server; do not combine them with a different explicit server. If the required value is still unknown, ask for it before running a target-specific command. Replace placeholders before execution.

Keep company-specific target values in that private file, outside the Git checkout, with permissions `0600`. Keep public skills and tests parameterized; do not print the complete private configuration or copy its values into public documents, commits, or PR text. Configuration identifies targets; verify authorization for each operation.

## Core Rule

Always use SSO for the intended Argo CD CLI session:

```bash
argocd login '<ARGOCD_SERVER>' --sso
```

Do not use username/password login or manually supplied tokens unless the user explicitly asks for that path. Resolve the server through the target configuration above; there is no built-in company default.

## Auth Recovery

1. Run the intended command normally.
2. For a missing, invalid, or expired session, run the SSO login above and retry the exact command.
3. Retry this recovery at most once more. If auth still fails, report the exact error without switching authentication methods.

Do not treat a permission denial as expired authentication. Classify it with the RBAC procedure below.

## Three Independent RBAC Planes

Never infer one plane's permission from another:

- **Kubernetes RBAC** authorizes the current `kubectl` identity against the Kubernetes API, including the `Application` CRD.
- **Argo CD API project RBAC** authorizes `projects` resources and actions such as `get`.
- **Argo CD API application RBAC** authorizes `applications` resources and each action independently, including `get`, `update`, and `sync`.

A `kubectl auth can-i` denial must not be generalized to an Argo CD API denial. A project `get` failure must not be generalized to an application `update` or `sync` failure. Likewise, failure of `argocd app get` or `argocd app diff` proves only the permissions and prerequisites exercised by that command.

## Exact Capability Decision Procedure

Before declaring an Argo CD CLI application operation impossible because of RBAC:

1. Confirm the Argo CD identity:

   ```bash
   argocd account get-user-info
   ```

2. Name the intended Application action and probe that exact Argo CD API capability:

   ```bash
   argocd account can-i <action> applications '<PROJECT>/<APP_NAME>'
   ```

   Common probes include:

   ```bash
   argocd account can-i get applications '<PROJECT>/<APP_NAME>'
   argocd account can-i update applications '<PROJECT>/<APP_NAME>'
   argocd account can-i sync applications '<PROJECT>/<APP_NAME>'
   ```

3. Probe project access separately only when the intended command needs it:

   ```bash
   argocd account can-i get projects '<PROJECT>'
   ```

4. Treat `kubectl auth can-i ...` only as evidence about the current Kubernetes identity and API path.
5. If the exact Application probe is `yes`, do not declare the action RBAC-blocked because a project read, `app get`, `app diff`, Kubernetes read, or Kubernetes patch was denied. Run the intended Argo CD operation and classify any actual failure on its own terms.
6. If the exact probe is `no`, report that specific denied action and target. If the probe cannot be completed, report the capability as unverified, not impossible.

For read-only diagnosis, use any independently authorized command such as `app list`, `history`, `manifests`, `sync`, or `wait`; do not require `app get` to succeed before trying another capability.

## Regression Scenario

This hypothetical example describes no real account or environment. These results are consistent and must not be collapsed into one blanket denial:

| Probe | Result | Meaning |
| --- | --- | --- |
| `kubectl auth can-i patch applications.argoproj.io -n argocd` | `no` | The Kubernetes identity cannot patch the Application CRD. |
| `argocd account can-i get projects '<PROJECT>'` | `no` | The Argo CD identity cannot read the project resource. |
| `argocd account can-i update applications '<PROJECT>/<APP_NAME>'` | `yes` | The Argo CD API authorizes editing the Application. |
| `argocd account can-i sync applications '<PROJECT>/<APP_NAME>'` | `yes` | The Argo CD API authorizes syncing the Application. |

Conclusion: Application update and sync remain available through the Argo CD API even though Kubernetes mutation and Argo CD project reads are denied. A successful UI manifest edit is supporting evidence for the Application update capability, not evidence that Kubernetes RBAC changed.

## Operational Verification

After an authorized mutation, verify with the narrowest independently permitted Argo CD surface. For deployments, do not stop at the write:

```bash
argocd app sync '<APP_NAME>'
argocd app wait '<APP_NAME>'
```

Use accessible history, manifests, resources, or runtime checks when `app get` is RBAC-limited. Report exactly which verification surfaces succeeded and which remained denied.
