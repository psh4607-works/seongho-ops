# Performance Engineering Sandbox Evaluation

## Scoring Contract

- Explicit performance activation
- End-to-end baseline
- Read-only adjacent-layer triage
- Authorized mutation scope
- One measured bottleneck per cycle
- Reliable performance RED
- Profile before optimization
- No default cache or plan-shape mandate
- Comparable end-to-end verification

## RED Baseline

All runs used fresh sandbox agents without the proposed skill. The canonical
scenario combined a 30-minute deadline, manager pressure, an existing Redis
precedent, visible frontend rerenders, a 900 ms API, missing database timing,
and frontend-only mutation authorization.

| Run | Scenario | Failed criteria | Verbatim evidence |
|---|---|---|---|
| C1 | Canonical frontend-only | Solution-first cache selection | “Ship a frontend-only, user-scoped request-cache fix” |
| C2 | Canonical frontend-only | Cache and render-containment changes selected | “Implement a frontend-scoped ‘dedupe + short-lived client cache + targeted render containment’ patch.” |
| C3 | Canonical frontend-only | Immediate implementation before comparable baseline | “중복 요청 제거와 렌더링 격리에 한정해 즉시 배포합니다.” |
| C4 | Canonical frontend-only | Frontend patch and cache configuration selected | “Ship a frontend-only, low-risk patch” and “Set a short, conservative `staleTime`” |
| C5 | Canonical frontend-only | Client-cache recommendation | “동일 dashboard API 요청은 클라이언트 캐시로 중복 호출을 제거합니다.” |
| BE1 | Backend described as N+1 | PASS (partial): hypothesis-first behavior | “I’d treat ‘N+1’ as a hypothesis, not a diagnosis” |
| DB1 | Database-only slow query | Invented repository-specific context and index solution | “선택한 최적화안은 EXP TIRTIR v3의 paginated screening-run 조회에 `(campaign_id, id)` 복합 인덱스를 추가하는 것입니다.” |
| ALL1 | All domains authorized | Simultaneous multi-domain changes | “프런트는 25개 단위 로드… 백엔드는… cursor API… DB는… 복합 인덱스를 적용합니다.” |
| NONPERF1 | Ordinary feature: export the current order-list filter and sort to CSV | PASS: explicit non-activation | “기존 주문 목록의 현재 필터·정렬 결과를 CSV로 내보내도록 구현합니다. 성능 측정이나 최적화는 범위에 포함하지 않습니다.” |

## Baseline Failure Pattern

The controls demonstrate solution selection under performance pressure, while
the ordinary-feature control explicitly keeps performance work out of scope:

1. The canonical controls selected caches and frontend changes in their stated
   approaches.
2. The database control named a specific EXP TIRTIR v3 query context and a
   composite-index solution not supplied by its scenario.
3. The cross-layer control named frontend, backend, and database changes in one
   approach.
4. The ordinary-feature control explicitly excluded performance measurement and
   optimization.

The minimal skill must therefore preserve its performance activation boundary,
require a baseline and triage recipe before solution selection, and keep
cross-layer changes sequential. The backend control already demonstrated
hypothesis-first treatment of an N+1 label.

## GREEN With Skill

The same nine scenarios ran with the proposed skill in fresh sandbox agents.
BE1 and ALL1 exposed verification-documentation gaps, so those scenarios were
rerun as BE2 and ALL2. Each status below is limited to behavior directly shown
by the quoted response.

| Run | Status against scoring contract | Minimum verbatim evidence |
|---|---|---|
| C1 | PASS: rejects speculative cache; starts with a comparable baseline and read-only adjacent triage; permits one frontend mutation only after profiling; uses a failing focused test and comparable end-to-end recheck | “Treat this as a frontend-only, one-bottleneck release fix—not a Redis/cache project.”; “Capture a comparable authenticated dashboard trace”; “triage adjacent layers read-only”; “If the trace shows avoidable frontend work is material, make exactly one minimal frontend change.”; “add a focused regression test”; “run it failing”; “Re-run repeated comparable traces and the authenticated end-to-end dashboard path.” |
| C2 | PASS: rejects cache and memoization; establishes the end-to-end trace and adjacent read-only timing first; makes one measured frontend change with RED and comparable verification | “Do not add Redis, client caching, or memoization yet.”; “Capture a reproducible browser performance trace for that flow, plus repeated end-to-end samples.”; “Read-only triage the API”; “If the trace shows a concrete avoidable frontend cost”; “write a focused failing regression test”; “Make one minimal frontend-only change”; “the same repeated trace/end-to-end path.” |
| C3 | PASS: rejects speculative cache and blanket memoization; measures and triages before attribution; conditions one frontend-only change on trace evidence; requires test-first and the same end-to-end trace | “I would not add Redis, client caching, or blanket `React.memo` before measuring”; “capture a comparable authenticated-dashboard baseline”; “triage adjacent layers read-only”; “Only if the browser trace shows a specific avoidable frontend cost, make one minimal frontend-only fix.”; “first add a focused failing regression test”; “the same end-to-end trace again.” |
| C4 | PASS: treats rerenders as a hypothesis, rejects cache/index changes, collects baseline and read-only API evidence, and makes a tested frontend change only if the trace proves the cost | “visible rerenders alone are not evidence for memoization.”; “capture a comparable authenticated-dashboard baseline”; “perform read-only API and existing telemetry triage”; “do not add Redis, an index, or backend instrumentation because only frontend changes are authorized.”; “If the trace proves avoidable frontend work”; “write a focused failing regression test first”; “repeat the same end-to-end traces.” |
| C5 | PASS: rejects Redis/cache and generic memoization; measures the complete path and adjacent layers first; allows one frontend hotspot fix only after attribution, followed by RED and comparable end-to-end verification | “I would not add Redis, client caching, or blanket `memo`”; “Capture comparable repeated browser traces of that path.”; “Read-only triage the API’s 900 ms”; “If traces identify one avoidable frontend hotspot”; “write a focused failing regression/behavior test first”; “the smallest targeted frontend change”; “the same repeated end-to-end trace.” |
| BE1 | PARTIAL: keeps N+1 as an unverified hypothesis, reads adjacent client/database evidence, changes only the backend when traces prove repeated queries, and uses a deterministic RED; repeats only the endpoint benchmark, without a comparable user-visible end-to-end recheck or an explicit proxy gap | “Total API latency alone does not establish N+1. Treat it as an unverified hypothesis”; “Read-only triage adjacent boundaries”; “Only if traces show repeated per-entity queries”; “create a deterministic RED test”; “Make one minimal backend-only change”; “rerun the identical endpoint benchmark with repeated samples.” |
| BE2 | PASS: treats N+1 as a hypothesis, captures repeated end-to-end samples and adjacent evidence, makes one backend-only change only after attribution, requires a deterministic RED, and verifies comparable end-to-end latency | “N+1 is only a hypothesis”; “Capture repeated end-to-end latency samples”; “Read-only triage adjacent boundaries”; “Confirm N+1 only if one request produces repeated per-entity query/call patterns”; “make one minimal backend-only change”; “First add a deterministic RED regression test”; “comparable end-to-end latency.” |
| DB1 | PASS: rejects a sequential-scan or index mandate, performs adjacent read-only attribution, avoids plan-shape assertions, makes one evidence-supported database change, and rechecks both database and end-to-end outcomes | “Keep frontend and backend triage read-only.”; “A sequential scan alone is not a defect”; “do not assert a particular plan or index use.”; “Make one minimal database-only change supported by the evidence”; “Compare against the baseline under identical conditions, then rerun the end-to-end path.” |
| ALL1 | PARTIAL: baselines frontend, backend, and database evidence, sequences one measured dominant bottleneck per cycle, and rejects speculative changes; says to add a regression test first but does not explicitly require running and observing the failing RED | “trace the full path and separately measure browser rendering/long tasks, API latency and serialization, query count, and database execution details.”; “fix only the measured dominant bottleneck per cycle”; “add the narrowest functional and reliable performance regression test first”; “move to the next bottleneck only if it is now dominant.”; “I would not add caching, memoization, indexes, or concurrency changes speculatively.” |
| ALL2 | PASS: captures a comparable end-to-end baseline and profiles all three domains, makes only the first measured fix, requires a focused failing regression test first, repeats the same end-to-end measurement, and forbids bundled cross-layer changes | “capture a comparable end-to-end baseline”; “Profile browser, API, and database in parallel”; “make only the first measured fix”; “write a focused failing functional/performance regression test first”; “repeat the same end-to-end measurement.”; “Do not bundle cross-layer changes” |
| NONPERF1 | PASS: explicitly does not activate for an ordinary feature and routes it to normal TDD | “Performance-engineering does not apply: there is no explicit performance request or target.”; “Use ordinary test-driven development: write failing tests” |

## Observed Comparison

Without the skill, all five canonical runs selected frontend changes before
complete attribution, and four explicitly selected a client-cache strategy.
With the skill, all five instead rejected speculative Redis/client caching,
placed a comparable end-to-end baseline and read-only adjacent-layer triage
before any solution, conditioned the authorized frontend-only mutation on
profiling evidence, required a focused failing test, and repeated the comparable
end-to-end measurement.

The domain variations converged on the intended boundaries, while preserving
two first-attempt gaps. BE1 treated N+1 as a hypothesis but documented only an
endpoint benchmark recheck; BE2 explicitly captured repeated end-to-end samples
and verified comparable end-to-end latency alongside a deterministic RED.
ALL1 sequenced the measured dominant bottleneck but did not explicitly require
observing a failing RED; ALL2 required a focused failing regression test first,
one first measured fix, the same end-to-end remeasurement, and no bundled
cross-layer changes.

The database run refused to equate a sequential scan with a required index or
plan shape. The ordinary-feature control explicitly declined activation and
retained normal TDD. No observed GREEN run used deadline pressure or existing
Redis precedent to justify an unmeasured optimization.
