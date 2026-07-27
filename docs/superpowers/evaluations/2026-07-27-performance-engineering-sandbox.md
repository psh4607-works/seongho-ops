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
| C1 | Canonical frontend-only | No end-to-end baseline; no adjacent read-only triage; cache selected before attribution | “Ship a frontend-only, user-scoped request-cache fix” |
| C2 | Canonical frontend-only | No end-to-end baseline; cache and render changes selected from incomplete evidence | “Implement a frontend-scoped ‘dedupe + short-lived client cache + targeted render containment’ patch.” |
| C3 | Canonical frontend-only | Immediate implementation before comparable baseline; cache selected without measured duplicate-request contribution | “중복 요청 제거와 렌더링 격리에 한정해 즉시 배포합니다.” |
| C4 | Canonical frontend-only | Profiles only the frontend after choosing the domain solution; no cross-layer baseline; client cache selected early | “Ship a frontend-only, low-risk patch” and “Set a short, conservative `staleTime`” |
| C5 | Canonical frontend-only | No cross-layer baseline; cache, memoization, virtualization, and lazy loading proposed together | “동일 dashboard API 요청은 클라이언트 캐시로 중복 호출을 제거합니다.” |
| BE1 | Backend described as N+1 | Partial pass: correctly treats N+1 as a hypothesis and profiles DB/outbound work, but does not establish the user-visible path or target before presenting conditional implementation | “I’d treat ‘N+1’ as a hypothesis, not a diagnosis” |
| DB1 | Database-only slow query | Invents a repository-specific query and index without supplied evidence; makes index-oriented plan shape a goal; omits adjacent read-only triage | “선택한 최적화안은 EXP TIRTIR v3의 paginated screening-run 조회에 `(campaign_id, id)` 복합 인덱스를 추가하는 것입니다.” |
| ALL1 | All domains authorized | Chooses frontend, backend, and database changes simultaneously; no baseline or dominant-bottleneck attribution | “프런트는 25개 단위 로드… 백엔드는… cursor API… DB는… 복합 인덱스를 적용합니다.” |

## Baseline Failure Pattern

The control agents usually respected the explicit mutation scope, but they
optimized from symptoms rather than an end-to-end attribution:

1. Frontend rerenders caused immediate memoization, virtualization, lazy-load,
   and client-cache proposals even though their contribution was not measured.
2. The existing Redis precedent pulled most canonical runs toward caching
   despite the absence of duplicate-request or invalidation evidence.
3. A database request triggered an invented query and concrete index, then used
   a preferred plan shape as the success condition.
4. Broad authorization encouraged simultaneous cross-layer changes, making
   causal attribution impossible.

The minimal skill must therefore shape the output around a baseline and triage
recipe before solution selection. It does not need to teach that N+1 is always
a hypothesis; the backend control already demonstrated that behavior.
