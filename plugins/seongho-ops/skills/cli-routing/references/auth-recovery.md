# CLI Authentication Recovery

Read this reference completely whenever a CLI reports missing, invalid, or expired authentication and the requested task cannot continue without recovery.

## Goal and boundary

Recover through the CLI vendor's official OAuth, device-code, SSO, OIDC, or login command. The browser is an interaction surface for the CLI flow, not a replacement connector or an independent API route.

- Do not reauthenticate when the real failure is RBAC, permission denial, rate limiting, network failure, wrong environment/profile, or a missing capability.
- Do not invalidate a working credential merely to test recovery. Use an isolated temporary config or HOME for end-to-end tests when the CLI supports it.
- Never ask the user to paste passwords, OTPs, recovery codes, API tokens, cookies, or device codes into chat.
- Do not print authorization URLs containing state, device codes, callback codes, or account identity. Transfer them internally to the chosen browser.
- Do not inspect browser cookies, password stores, local storage, or profile files.

## Recovery state machine

For `op` desktop integration, follow [the 1Password skill](../../1password/SKILL.md) instead of the generic login launch, browser, status-probe, and retry steps below: keep the existing task terminal and let the required operation request native authorization.

1. **Detect**: run the original command once or use the router's safe status probe. Preserve the exact error.
2. **Classify**: continue only for missing, invalid, revoked, or expired credentials/session. Stop and report other failure classes.
3. **Discover**: inspect the installed CLI's exact login/auth help before constructing a command. Do not guess flags from memory.
4. **Launch**: start one official CLI login/SSO command in a PTY and keep that process alive. Do not start duplicate login attempts while it waits for a callback or device approval.
5. **Choose a browser** using the browser order below. Open the CLI-provided URL without exposing it in chat.
6. **Complete or hand off**: use an already signed-in browser session when available. If password, passkey, OTP, CAPTCHA, account selection with ambiguity, or security-key interaction is required, let the user complete that step in the browser. Follow Browser/Computer Use confirmation policy before an agent clicks a final `Authorize`, `Approve`, `Allow`, or similar control that grants persistent access.
7. **Wait for callback**: poll the original CLI PTY. Do not copy callback parameters manually unless the official flow explicitly requires it.
8. **Verify**: rerun the CLI's non-secret auth/status probe, then retry the exact original command once.
9. **Stop boundedly**: at most two login attempts for the same failure. If both fail, report the exact CLI/browser/callback error without switching to passwords or invented token workarounds.

## Browser order

Use the first practical surface that can complete the official CLI flow:

1. **CLI-launched system browser** when it opens correctly and the user can complete any personal security step.
2. **ChatGPT Desktop in-app Browser Use** as the default agent-controlled browser when no existing provider session is required or the user is willing to sign in there.
3. **Chrome Browser Use** when the task specifically depends on an existing Chrome login/profile and the user has approved that browser path.
4. **Dia** when the user requests Dia or its existing logged-in session is the best route. Ensure `dia-cdp@dia-cdp` is installed, read its skill, and use the bundled `scripts/dia-cdp` CLI. Never use a raw DevToolsActivePort/WebSocket client. Dia may show `Allow debugging connection?`; follow Computer Use confirmation policy and use the supported local UI path.
5. **Manual handoff** when the supported browser surfaces lack the required login, or the page requires password/passkey/OTP/CAPTCHA/security-key input.

When Browser Use is selected, read the matching Browser skill before navigation. Use Computer Use only for native browser/OS dialogs that Browser Use or the purpose-built Dia CLI cannot control.

## Verified service routes

Always re-check `--help` because installed versions can change.

Resolve Argo CD placeholders through the [Argo CD target configuration](../../argocd/SKILL.md#target-configuration) before starting login.

| CLI/service | Official recovery route | Verification |
| --- | --- | --- |
| `gh` | `gh auth login --web` | `gh auth status`, then a minimal API call if needed |
| `argocd` | `argocd login '<ARGOCD_SERVER>' --sso`; use `--sso-launch-browser=false` only when Browser Use must open the emitted URL | `argocd account get-user-info`; then retry the intended app command |
| `kubectl` | No universal login. Inspect the current context's exec credential provider and recover through its cloud/SSO CLI | `kubectl get --raw /version` and the intended read |
| `supabase` | Inspect `supabase login --help`; use only its official supported credential flow | `supabase projects list --output-format json` |
| `pup` | `pup auth login --read-only` for investigations, optionally with the intended site/org flags | `pup auth status`, then `pup --read-only ...` |
| `sentry` | `sentry auth login --read-only`; it uses device-code OAuth | `sentry auth status --fresh`, then retry the intended read |
| `sentry-cli` | Prefer migrating interactive work to `sentry` OAuth. Use `sentry-cli` credential setup only when an existing compatibility/CI workflow requires it | `sentry-cli info` |
| `vercel` | `vercel login` using its current supported browser/email flow | `vercel whoami` |
| `databricks` | `databricks auth login --host <host> --profile <profile>` | `databricks auth profiles` |
| `aws` | `aws sso login --profile <profile>` when the profile is SSO-backed | `aws sts get-caller-identity --profile <profile>` with identity output minimized |
| `gcloud` | `gcloud auth login` or the profile's official application-default flow when that is what the task needs | suppress output from `gcloud auth print-access-token`, then retry the intended read |
| `cloudflared` | `cloudflared tunnel login` | a minimized read-only tunnel list |
| `vault` | Use the configured provider method, commonly `vault login -method=oidc`; never invent a method | `vault token lookup` with sensitive output suppressed |
| `notion` | Inspect `notion auth login --help` and use its official flow | `notion auth status` |
| `op` | Load [the 1Password skill](../../1password/SKILL.md). Preserve the task terminal; with desktop integration, let the needed operation request approval. Use `op signin` only when required by the configured authentication mode, never as a routine preflight | Retry the required operation in the same terminal; `op whoami` only when identity itself matters. Do not start another authorization while one is pending |

## Safe testing

For an end-to-end recovery test:

- use a fresh temporary config/HOME supported by the CLI;
- request the smallest read-only scopes available;
- never log out or overwrite the user's working credential;
- stop immediately before final browser approval if confirmation is required;
- after approval, verify the temporary credential, then leave the user's original config untouched;
- close or restore temporary browser tabs when the test finishes.

The tested Sentry shape on this machine is `sentry auth login --read-only` in an isolated HOME, followed by the CLI-issued device authorization page in a supported browser and `sentry auth status --fresh` against that same isolated HOME.
