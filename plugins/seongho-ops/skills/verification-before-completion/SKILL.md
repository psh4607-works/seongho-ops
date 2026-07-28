---
name: verification-before-completion
description: Use when about to claim work complete, fixed, or passing, or before a commit, push, pull request, handoff, or next task
---

# Verification Before Completion

Evidence before claims. No completion claim without fresh evidence.

## Gate

1. Identify the command or observation that proves each claim.
2. Run the smallest sufficient check freshly against the current state; scale it to the claim and risk.
3. Read the exit code, failure count, and relevant output.
4. Compare the evidence with the exact claim.
5. If it does not prove the claim, state exactly what remains unverified and why.

| Claim | Required evidence |
|---|---|
| Tests pass | Named test: zero failures |
| Build succeeds | Build exits zero |
| Bug is fixed | Original symptom passes |
| Requirements met | Checklist plus checks |
| Delegated work is done | Inspect diff; verify independently |

Stale, partial, different-scope, CI-future, and agent-reported results are not fresh evidence.

## Common Mistakes

Do not say “should pass,” substitute unrelated checks, defer proof to CI, or run a costly full suite when a targeted check completely proves the claim.
