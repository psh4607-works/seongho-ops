---
name: systematic-debugging
description: Use when investigating a bug, test failure, flaky behavior, incident, build failure, integration failure, or unexpected behavior before proposing or implementing a fix
---

# Systematic Debugging

Evidence before fixes. A plausible cause or correlation is only a hypothesis.

## Investigation Loop

1. Capture the exact symptom, error, environment, and relevant recent change.
2. Reproduce the smallest case. If it is intermittent, record timing and conditions; if it cannot reproduce, add observability instead of guessing.
3. Trace data, state, and timing across the failing path. At component boundaries, compare inputs, outputs, configuration, and a working path.
4. State one falsifiable hypothesis: “X causes the symptom because Y evidence.”
5. Run the smallest discriminating experiment; change one variable.
6. If confirmed, add a failing reproduction test and change only the root cause.
7. Rerun the original symptom and relevant regression checks. If disproved, discard the hypothesis and repeat.

| Signal | Response |
|---|---|
| Timeout | Measure the blocked phase; do not merely increase it |
| Flaky pass | Preserve conditions; do not rerun until lucky |
| Cross-system failure | Locate the first broken boundary |
| Three failed fixes | Stop and reassess fundamentals |

After three failed fix attempts, stop and question the assumptions or architecture before another patch.

## Common Mistakes

Do not bundle speculative fixes, patch a downstream symptom, infer causation from correlation, or treat a senior opinion, deadline, or sunk cost as evidence.

