---
name: performance-engineering
description: Use when the user explicitly requests performance analysis, optimization, benchmarking, performance regression coverage, or a measurable latency, throughput, memory, CPU, query-count, rendering, payload-size, build-time, or resource-usage target.
---

# Performance Engineering

Use this skill only for an explicit performance request. Do not activate for an
ordinary feature, bug fix, refactor, test, or build with no performance target;
report a potentially expensive path as a follow-up risk instead.

Production changes require `seongho-ops:test-driven-development`. Assessment-only
work is read-only and does not require production-code TDD.

## Workflow

1. Classify the request as assessment-only or improvement-authorized. Record
   which of frontend, backend, and database the user authorized to change.
2. Read [measurement guidance](references/measurement.md). Define the
   user-visible end-to-end path, representative fixture, environment, metric,
   and existing product budget or SLO. Do not invent a universal threshold.
3. Capture a reproducible end-to-end baseline. If the real path is unavailable,
   use a bounded proxy and report that evidence gap.
4. Triage frontend, backend, and database boundaries read-only far enough to
   attribute the dominant bottleneck. Read the applicable domain guidance:
   [frontend](references/frontend.md), [backend](references/backend.md), and
   [database](references/database.md).
5. Select one measured bottleneck for this cycle. Profile before optimizing and
   modify only an authorized domain; adjacent-domain triage remains read-only.
6. Create the narrowest reliable functional and performance RED. Run the
   focused functional and performance RED and observe its expected failure
   before making the production change. Make one minimal evidence-backed
   change, then run focused functional tests, domain measurements, and the
   comparable end-to-end path again.
7. Stop when the target is met. If another domain becomes dominant, repeat only
   when that domain is authorized; otherwise report it without changing it.

| Decision | Required response |
|---|---|
| No explicit performance request | Do not activate. |
| Assessment only | Measure and report; do not modify production code. |
| One domain authorized | Triage all boundaries read-only; mutate that domain only. |
| Multiple domains authorized | Improve sequentially, one measured bottleneck per cycle. |
| No product budget or SLO | Record the target as unknown; do not invent one. |
| No real-path measurement | Use a bounded proxy and state the evidence gap. |

## Measurement and Safety Rules

- Deterministic measures such as query count, render count, allocation, payload
  size, or operation count can be reliable blocking RED tests when they reflect
  the target. Noisy wall-clock measures need controlled repeated samples and
  never become a single-run flaky gate.
- Start with measurement errors and unnecessary work, then consider algorithm or
  data structure, query and I/O shape, batching, bounded concurrency, and
  payload or build graph. Cache or memoization comes last and is never default.
  It is admissible only when repeated work is measured as dominant and the
  change verifies correctness, key completeness, invalidation, isolation,
  capacity or expiry, concurrent writers, safe miss/failure behavior, cold-path
  acceptability, observability, security, and cost.
- An index or concurrency change is likewise a candidate only after measurement
  shows its contribution; preserve correctness, integrity, security,
  accessibility, and required cold-path behavior.
- Do not infer N+1, an index need, or any frontend cause from code shape alone.
  Do not require a plan shape, universal reflow/repaint count, or universal
  latency threshold.

## Observed Rationalization Counters

| Observed pressure response | Count | Required counter |
|---|---:|---|
| Solution-first cache or memoization | 5 | Baseline, profile, and attribute first. |
| Immediate change without comparable baseline | 1 | Measure the end-to-end path before and after. |
| Unsupported index proposal | 1 | Inspect representative plan and outcome evidence first. |
| Simultaneous cross-layer changes | 1 | Change one measured bottleneck sequentially. |

These counts come from the baseline evaluation. Add a counter only when a
future evaluation observes a new rationalization.

## Red Flags

- An optimization starts before baseline, read-only adjacent triage, or profiling.
- A change touches a domain the user did not authorize.
- Multiple bottlenecks or cross-layer changes are bundled into one cycle.
- A single wall-clock result gates a change, or a threshold was invented.
- Cache, memoization, index, or concurrency is proposed before measured evidence.

## Completion Checklist

- [ ] Explicit performance activation and mutation authorization are recorded.
- [ ] Comparable end-to-end baseline and after measurement exist, or the proxy
      and evidence gap are reported.
- [ ] Frontend, backend, and database boundaries received read-only triage.
- [ ] Each production change followed `seongho-ops:test-driven-development`.
- [ ] One measured bottleneck was changed per cycle in authorized domains only.
- [ ] Functional tests, reliable performance RED, and outcome verification pass.
- [ ] Remaining unauthorized or non-dominant bottlenecks are reported, not changed.
