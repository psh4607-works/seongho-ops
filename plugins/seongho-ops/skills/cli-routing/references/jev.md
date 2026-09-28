# Jev / TypeSafe Routing

## Choose the interface

Load the official `typesafe-ai` skill before designing questions or implementing an integration. Follow its links to the [live TypeSafe docs](https://docs.typesafe.ai/llms.txt) for question and API contracts.

- **One-off development judgments:** use the connected `jev` MCP. Put independent questions about the same state into one `evaluate` call. Use `validate` for offline request checks and `list_models` for available models.
- **Shell scripts, file batches, account diagnostics, explicit CLI requests, or unavailable MCP:** use the installed `jev` CLI. Inspect `command -v jev` and the relevant `jev <command> --help`; `jev spec` exposes the command tree as JSON. Preserve the intended account/profile, endpoint, and model when switching from MCP.
- **Repeatable application features:** use the official TypeSafe SDK for the project's language. Keep workflow control and deterministic rules in application code.

The `jev` CLI and its MCP server are community tooling, separate from the official TypeSafe SDK. This plugin supplies routing guidance; installation and connection setup remain separate tasks.

## CLI checks and execution

| Need | Command |
| --- | --- |
| Inspect the installed CLI build | `jev version -o json` |
| Check whether the API accepts the configured key | `jev auth status --field authenticated` |
| List account models | `jev models list -o json` |
| Validate a request without sending it | `jev validate -f request.json --strict -o json` |
| Inspect the exact request without sending it | `jev eval -f request.json --dry-run -o json` |
| Evaluate one state with several questions | `jev eval -f request.json -o json` |
| Preview a file batch without sending it | `jev batch run -f questions.json --input rows.jsonl --dry-run -o json` |

For batches, inspect the dry-run row count and estimated cost before sending the requested scope. An unknown cost estimate is not zero. Read `jev batch run --help` for input selection, output files, and resume behavior.

## Judgment and result handling

- Jev returns typed judgments and probabilities. Follow `typesafe-ai` for choosing Noul, Choice, or Score; include an escape option in a Choice when none of the named options may fit.
- Keep arithmetic, counting, exact comparisons, and date calculations in code. Confidence describes the answer distribution; validate decisions against representative cases.
- Record the returned versioned model and relevant usage, latency, and estimated cost when testing. A model-list response proves model access; use a synthetic case with an expected answer to verify inference.
- CLI exit `10` means an evaluated gate was false; `11` means abstention. Distinguish those from request, auth, or network failures using subcommand help. Do not retry them as transport errors.
- Check auth through `auth status`; `TYPESAFE_API_KEY` overrides stored profile keys. Never print API keys or dump credential files. For genuine auth failures, read [auth-recovery.md](auth-recovery.md) and `jev auth login --help`. Jev uses API-key entry: let the user enter the key at the CLI's hidden prompt, never in chat; do not invent an OAuth flow.
