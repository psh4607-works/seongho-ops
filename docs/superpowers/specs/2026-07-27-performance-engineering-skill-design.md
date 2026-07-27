# Performance Engineering Skill Design

## Goal

Add a portable `seongho-ops:performance-engineering` skill for tasks where the
user explicitly asks for performance analysis, optimization, benchmarking,
performance regression coverage, or a measurable performance target.

The skill must support frontend, backend, and database work without making
performance procedure part of ordinary feature development. When the user
requests changes in only one domain, adjacent domains are inspected read-only
and only the authorized domain may be modified.

## Activation Boundary

Activate for explicit performance language such as latency, throughput, memory,
CPU, query count, N+1, rendering time, reflow, repaint, bundle size, build time,
benchmarking, profiling, or a performance budget.

Do not activate for ordinary features, bug fixes, refactors, tests, or builds
that have no performance requirement. A potentially expensive path may be
reported as a follow-up risk, but it does not authorize benchmark work or
optimization.

Performance-related production changes must also use
`seongho-ops:test-driven-development`. Read-only performance assessment does not
require production-code TDD.

## Architecture

The plugin will package one entry skill with progressive domain references:

```text
plugins/seongho-ops/skills/performance-engineering/
  SKILL.md
  agents/openai.yaml
  references/
    measurement.md
    frontend.md
    backend.md
    database.md
```

`SKILL.md` owns activation, scope, cross-layer triage, the improvement loop, and
completion criteria. It routes only to the domain references relevant to the
observed request. Domain references provide measurement choices, diagnostic
signals, reliable RED tests, and common attribution mistakes without prescribing
one framework or optimization.

## Workflow Contract

1. Classify the request as assessment-only or improvement-authorized, and record
   the domains the user allowed to change.
2. Define the user-visible end-to-end path, representative fixture, environment,
   metric, and target. Prefer an existing product budget or SLO; do not invent a
   universal threshold.
3. Capture a reproducible end-to-end baseline. If the real path cannot be
   measured, use a bounded proxy and report the evidence gap.
4. Triage frontend, backend, and database boundaries read-only far enough to
   attribute the dominant bottleneck.
5. Select one bottleneck for the next improvement cycle. Do not modify adjacent
   domains unless the user authorized them.
6. Create the narrowest reliable functional and performance RED. Deterministic
   measures such as query count, render count, allocation, payload size, or
   operation count may block a PR. Noisy wall-clock measures require controlled
   repeated samples and must not become a single-run flaky gate.
7. Profile before optimizing. Apply one minimal, evidence-backed change.
8. Re-run focused functional tests, domain performance measurements, and the
   end-to-end path under comparable conditions.
9. Stop when the target is met. If another domain remains the bottleneck, repeat
   only when it is authorized; otherwise report it without changing it.

When all three domains are authorized, changes remain sequential so each
improvement's effect is attributable. When one domain is authorized, adjacent
read-only triage and end-to-end before/after verification remain mandatory.

## Domain Contracts

### Frontend

Use user-visible interaction and frame stability as outcome measures. Treat
render count, long tasks, style recalculation, layout/reflow, paint, composite,
DOM size, JavaScript execution, heap, bundle size, and network work as
diagnostic measures.

Do not use a universal reflow or repaint count as a success criterion. Browser,
viewport, fixture, and interaction conditions must be controlled and recorded.

### Backend

Separate queueing, framework or serialization work, application logic, database
time, and outbound calls. Relevant measures include latency distribution,
throughput, CPU, memory, allocations, event-loop or thread blocking, call count,
query count, and concurrency.

Do not assume N+1, caching, or concurrency is the bottleneck from code shape
alone. Confirm its contribution in the representative path.

### Database

Use representative data shape and inspect execution time, actual versus
estimated rows, loops, buffers, I/O, spills, locks, scanned versus returned
rows, selectivity, and application query count. `EXPLAIN ANALYZE` and equivalent
plans are diagnostic evidence.

Do not require a particular plan shape such as index use. Sequential scans and
other plan choices may be correct for a given distribution. Prefer stable
outcome budgets and integrity-preserving tests over brittle plan assertions.

## Optimization Safety

Optimization order begins with measurement errors and unnecessary work, then
algorithm or data structure, query and I/O shape, batching, bounded concurrency,
payload or build graph, and only then cache or memoization when evidence
supports it.

Cache is never a default recommendation. It is admissible only when repeated
work is the measured bottleneck and the change defines and verifies correctness,
key completeness, invalidation, isolation, capacity or expiry, concurrent
writers, safe miss or failure behavior, cold-path acceptability, observability,
security, and cost.

Performance work must not trade away functional correctness, data integrity,
security, accessibility, or required cold-path behavior.

## Testing

Skill authoring follows documentation TDD:

1. Run sandbox pressure scenarios without the new skill and record failures.
   Required scenarios cover:
   - a frontend request that tempts immediate memoization or caching without
     adjacent-layer triage;
   - a backend API request described as N+1 where database evidence does not
     support that attribution;
   - a database-only improvement where the agent is tempted to modify backend
     code or use a brittle plan-shape assertion;
   - a cross-layer request where simultaneous frontend, backend, and database
     changes would make causality unclear;
   - an ordinary feature request with no performance language, where the skill
     must not activate.
2. Add failing plugin contract tests for packaging, trigger-focused metadata,
   implicit invocation, domain references, read-only adjacent triage, scoped
   mutation, end-to-end verification, and cache safety.
3. Add the minimum skill files needed to pass.
4. Re-run the same sandbox scenarios with the skill and verify correct
   activation, bottleneck attribution, scoped mutation, one-change cycles, and
   no default-cache behavior.
5. Add only counters for rationalizations observed during testing, then run the
   complete package test suite.

Sandbox scenario tests are behavioral evidence for the guidance. Static contract
tests remain the deterministic repository regression guard.

## Packaging

The plugin and package versions will move from `0.3.0` to `0.4.0` as a
backward-compatible skill addition. The manifest and README will expose
performance engineering as an implicitly invocable capability.

This task will verify the skill in the isolated development worktree. It will
not install the development snapshot globally, publish a release, push, open a
pull request, or merge without a separate request.

## Non-Goals

- Automatically benchmarking every feature or TDD task.
- Defining universal frontend, backend, or database performance thresholds.
- Treating caches, memoization, indexes, concurrency, or remote caches as
  preferred solutions.
- Mutating a domain the user did not authorize.
- Replacing repository-specific load-test tools, SLOs, fixtures, or CI gates.
- Converting unstable single-run wall-clock measurements into blocking tests.
