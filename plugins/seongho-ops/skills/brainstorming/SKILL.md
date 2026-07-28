---
name: brainstorming
description: Use when a non-trivial change has unclear requirements, boundaries, trade-offs, or success criteria before implementation
---

# Brainstorming

Resolve material design uncertainty before implementation. Scale the ceremony to risk.

## Decision Gate

1. Inspect the current context, existing patterns, and constraints.
2. State the goal, constraints, unresolved decisions, and success criteria.
3. If uncertainty affects behavior or architecture, give a recommended approach and only meaningful alternatives with trade-offs.
4. Present a concise design covering boundaries, data flow, failures, and verification. Get approval before material or hard-to-reverse implementation.
5. If the change is already clear and reversible, state important assumptions and proceed. No mandatory spec is required.

When material uncertainty remains, stop after the recommendation and request approval. A deadline, feature flag, demo-only path, or provisional assumption does not authorize implementation.

| Situation | Response |
|---|---|
| Clear and reversible | State assumptions; proceed |
| Ambiguous or non-trivial | Recommend an approach; get concise approval |
| Cross-system or high-risk | Write a focused design or plan |

Example: payment retries require agreement on retryable failures, idempotency, user state, and proof of success before wrapping a call in a loop.

## Common Mistakes

- Asking the user what repository inspection can answer
- Inventing alternatives without a real trade-off
- Turning a small reversible edit into an architecture exercise
- Coding through a material unresolved decision
