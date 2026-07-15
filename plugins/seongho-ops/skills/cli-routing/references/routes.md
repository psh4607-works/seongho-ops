# Operational CLI Routes

Read this reference completely before selecting a CLI for service-facing, remote, package/runtime, or state-changing work.

| Area | CLI | Route contract |
| --- | --- | --- |
| GitHub | `git`, `gh` | Use `gh` for PRs, issues, reviews, checks, Actions, and APIs. Follow the installed GitHub skills for review, CI, and publishing workflows. |
| Argo / Kubernetes | `argocd`, `kubectl`, `helm`, `k9s` | Load `argocd`; prefer app-scoped Argo reads when Kubernetes RBAC blocks access. |
| Supabase / DB | `supabase`, `psql`, `mongosh`, `sqlite3` | Load `supabase`; state target and environment before mutations. Load the Postgres best-practices skill for queries, schemas, and performance work. |
| Datadog | `pup` | Hard route: prefer `--read-only`. Never use a Datadog connector or MCP. |
| Sentry | `sentry` | Hard route: never use a Sentry connector, MCP, or old plugin. Use `sentry-cli` only for legacy compatibility and never pass `--show-token`. |
| OpenSearch | `opensearch-cli` | Use the configured profile and inspect subcommand help. |
| Deploy / cloud | `vercel`, `databricks`, `aws`, `gcloud`, `cloudflared` | Select project, profile, region, and environment explicitly when needed. For a protected `*.vercel.app` preview in the Codex in-app browser, load `seongho-ops:vercel-preview-browser` and the bundled Browser skill. |
| Secrets / containers | `vault`, `op`, `docker`, `docker compose` | Check session or daemon status without exposing secrets. |
| Browser QA | `playwright` | Follow global browser routing; rendered state requires a supported browser path. |
| Runtimes | repository package manager, `python3`/`uv`, `cargo`, JDK tools | Respect lockfiles and repository toolchains. INF Gradle/Kotlin work may require JDK 21. |
| AI coding | `codex`, `claude`, `gemini`, `opencode`, `cursor-agent` | Keep conversational work interactive. Reserve `codex exec` for bounded disposable work. |

## Selection rules

1. Prefer the purpose-built, already-authenticated local CLI.
2. Use the narrowest command that can answer or perform the requested action.
3. State the target environment before writes.
4. If a command fails, classify the failure before choosing a fallback.
5. Do not replace a hard-routed CLI with a connector or MCP.
