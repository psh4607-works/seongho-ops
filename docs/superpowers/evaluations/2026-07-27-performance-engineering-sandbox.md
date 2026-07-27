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
