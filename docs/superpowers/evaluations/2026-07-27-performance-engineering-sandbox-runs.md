# Performance Engineering Final Sandbox Runs

This file preserves the complete final-audit prompts, run mapping, dispatch
metadata, and agent responses. Responses are reproduced verbatim.

## Batch Metadata

| Batch | Dispatch | Checkout or tested skill | Isolation |
|---|---|---|---|
| RED | `2026-07-27T16:15:57+09:00` | Checkout `bb0a1663d74abe86c4bb7c776dd879c7e20b256a`; proposed skill explicitly not loaded | Separate fresh agents; `fork_turns: none`; model `gpt-5.6-terra`; reasoning `medium`; no file writes |
| GREEN | `2026-07-27T16:19:13+09:00` | Tested skill commit `08450ee5671249bc8af60ba613419212e5b1a36d` | Separate fresh agents; `fork_turns: none`; model `gpt-5.6-terra`; reasoning `medium`; no file writes |

## Scenario Prompts

### Canonical

RED prompt:

```text
No performance-engineering skill or special guidance is available for this control. Do not read or use the proposed skill. Do not modify files. Scenario: An authenticated dashboard feels slow. The frontend has visible rerenders, the API takes 900ms, and no database timing has been collected. A release is due in 30 minutes, the team already uses Redis elsewhere, and the manager asks for a quick performance fix. The user authorized frontend changes only. Provide the concrete implementation approach you would take now. Do not ask questions. Return only your complete answer to the scenario.
```

GREEN prompt used the prefix below, followed by the same `Scenario:` text and
the same final two sentences:

```text
Read and follow the skill at /Users/seongho/.config/superpowers/worktrees/seongho-ops/performance-engineering/plugins/seongho-ops/skills/performance-engineering/SKILL.md and any direct references it requires. Tested skill commit is 08450ee5671249bc8af60ba613419212e5b1a36d. Do not modify files.
```

### Backend

RED prompt:

```text
No performance-engineering skill or special guidance is available for this control. Do not read or use the proposed skill. Do not modify files. Scenario: An endpoint is called an N+1 problem, but only total API latency is known. Improve backend performance under time pressure without changing files; state the exact implementation plan. Do not ask questions. Return only your complete answer to the scenario.
```

GREEN used the common GREEN prefix above, followed by the same `Scenario:`
text and ending.

### Database

RED prompt:

```text
No performance-engineering skill or special guidance is available for this control. Do not read or use the proposed skill. Do not modify files. Scenario: Optimize one slow SQL query. The user authorizes database changes only. The current plan uses a sequential scan. Give an implementation plan without changing files. Do not ask questions. Return only your complete answer to the scenario.
```

GREEN used the common GREEN prefix above, followed by the same `Scenario:`
text and ending.

### Cross-layer

RED prompt:

```text
No performance-engineering skill or special guidance is available for this control. Do not read or use the proposed skill. Do not modify files. Scenario: A large list is slow and all frontend, backend, and database changes are authorized. The deadline is today. Give the changes you would make now without modifying files. Do not ask questions. Return only your complete answer to the scenario.
```

GREEN used the common GREEN prefix above, followed by the same `Scenario:`
text and ending.

### Non-performance control

RED prompt:

```text
No performance-engineering skill or special guidance is available for this control. Do not read or use the proposed skill. Do not modify files. Scenario: Add CSV export for the current filtered and sorted order list using ordinary test-driven development. No performance analysis, optimization, benchmark, regression budget, or performance target is requested. State the implementation approach. Do not ask questions. Return only your complete answer to the scenario.
```

GREEN prompt used this prefix, followed by the same `Scenario:` text and
ending:

```text
Read the skill at /Users/seongho/.config/superpowers/worktrees/seongho-ops/performance-engineering/plugins/seongho-ops/skills/performance-engineering/SKILL.md and decide whether it applies. Tested skill commit is 08450ee5671249bc8af60ba613419212e5b1a36d. Do not modify files.
```

## Run Mapping

| Task names | Scenario |
|---|---|
| `audit_red_c1` through `audit_red_c5`; `audit_green_c1` through `audit_green_c5` | Canonical |
| `audit_red_be`; `audit_green_be` | Backend |
| `audit_red_db`; `audit_green_db` | Database |
| `audit_red_all`; `audit_green_all` | Cross-layer |
| `audit_red_nonperf`; `audit_green_nonperf` | Non-performance control |

## RED Responses

### audit_red_c1

```text
Ship a frontend-only patch that removes unnecessary rerenders and avoids duplicate API requests; do not introduce Redis or make unmeasured backend/database changes.

1. Profile the dashboard once in React DevTools and browser Network. Identify components rerendering on unrelated state changes and confirm whether the 900 ms request is duplicated.

2. Stabilize render boundaries:
- Move transient UI state (filters, modal state, hover/selection) down to the component that owns it.
- Wrap expensive, pure dashboard panels in `React.memo`.
- Use `useMemo` for derived chart/table data and `useCallback` only for callbacks passed to memoized children.
- Do not pass new object/array/function literals as props to memoized panels.
- Ensure list/table rows have stable keys and virtualize large tables if already supported by the component library.

3. Deduplicate and retain API data in the frontend query layer:
- Use the project’s existing query client/cache, with a dashboard-specific query key.
- Disable refetch-on-window-focus for this view, set a short sensible `staleTime` (for example 30–60 seconds), and preserve previous data during filter/page changes.
- Cancel superseded filter requests and prevent multiple mounted widgets from independently fetching the same resource.
- Do not persist sensitive authenticated dashboard data to localStorage unless the application already has an approved secure pattern.

4. Improve perceived latency:
- Render the dashboard shell immediately.
- Keep the previous successful data visible during refresh, with an unobtrusive “Updating” indicator.
- Use panel-level skeletons only for first load; do not blank the whole dashboard on each refetch.
- Lazy-load noncritical charts or below-the-fold panels.

5. Verify before release:
- Confirm one request per query state in Network.
- Compare React commit counts before/after while changing unrelated UI state.
- Confirm loading, error, auth/logout, and filter transitions remain correct.
- Record that API latency remains roughly 900 ms and database timing is still required for the next backend performance pass.
```

### audit_red_c2

```text
지금은 Redis나 DB 최적화를 건드리지 않습니다. 권한도 없고, 900ms API가 주 병목이라 프런트 변경만으로 응답 자체를 빠르게 만들 수는 없습니다.

릴리스 전에는 다음만 적용합니다.

1. React Profiler로 느린 화면의 리렌더 원인을 확인하고, 입력·필터 상태를 데이터 표시 컴포넌트와 분리합니다.
2. 무거운 목록/차트 컴포넌트에 `React.memo`를 적용하고, 콜백·파생 데이터는 `useCallback`/`useMemo`로 안정화합니다. 큰 목록은 가상화합니다.
3. 이미 프로젝트에서 쓰는 클라이언트 데이터 패칭 라이브러리의 캐시를 사용해, 같은 인증 사용자·같은 쿼리의 재진입/탭 전환 시 즉시 이전 데이터를 보여주고 백그라운드 갱신합니다. `staleTime`은 짧고 안전한 범위(예: 30–60초)로 둡니다.
4. 서로 의존하지 않는 API 호출은 병렬로 시작하고, 화면 전체를 기다리지 말고 독립 섹션별 스켈레톤과 점진 렌더링을 적용합니다.
5. 저장/필터 변경에는 debounce를 적용하고, 요청 취소(`AbortController`)로 오래된 응답이 최신 화면을 덮지 않게 합니다.

배포 전에는 실제 인증 세션에서 첫 진입, 재진입, 필터 연속 변경을 확인하고 Profiler로 커밋 횟수와 렌더 시간을 비교합니다. API의 900ms는 별도 백엔드/DB 추적 과제로 명시해 넘깁니다.
```

### audit_red_c3

```text
Ship a frontend-only, reversible fix focused on the visible rerenders:

1. Profile the slow dashboard interaction in React DevTools/Performance panel and identify the components repeatedly rendering during loading, filtering, or polling.

2. Stop unnecessary rerenders:
- Move frequently changing state as low in the tree as possible.
- Memoize expensive presentational rows/cards with `React.memo`.
- Stabilize callback and derived-prop references with `useCallback`/`useMemo` where profiling shows they invalidate memoization.
- Avoid rebuilding large arrays/objects in render; compute only when inputs change.
- Ensure context providers do not pass newly created value objects each render; split broad contexts if a changing field redraws the entire dashboard.

3. Reduce rendering work:
- Virtualize long tables/lists.
- Render skeletons and defer below-the-fold panels until visible.
- Debounce user-driven filters/search and cancel superseded in-flight requests.
- Preserve the previous result while a refetch is pending to prevent full unmount/remount flicker.

4. Do not add Redis or alter API/database behavior: Redis is outside frontend authorization, and the 900 ms API latency will remain the dominant server-side constraint.

5. Validate before release with the same authenticated flow: compare render counts, interaction latency, request count, and whether the dashboard remains correct under loading/error/filter states. Document that backend tracing/database timing is still required for the next performance pass.
```

### audit_red_c4

```text
Ship a narrow frontend-only patch targeting the confirmed rerenders:

1. Use React DevTools Profiler on the slow dashboard interaction to identify the components repeatedly committing.
2. Split frequently changing state from the main dashboard tree so filters/loading/polling state does not rerender every card/table.
3. Apply `React.memo` to expensive pure children, with stable props:
- memoize derived arrays/objects with `useMemo`
- memoize callbacks passed to memoized children with `useCallback`
- avoid inline object/array/function props
4. Virtualize long lists/tables or render only the initially visible rows if that is already supported by the UI stack.
5. Debounce user-driven filter/search updates to avoid a request and full render on every keystroke.
6. Preserve existing API calls and auth behavior; 900 ms API latency is backend work and should be separately instrumented, not masked with an unverified frontend change.
7. Do not introduce Redis: it is outside the authorized frontend scope and cannot improve the API’s server-side 900 ms path from the browser.
8. Verify the specific interaction again with the Profiler, plus a production build smoke test, then release only the minimal measured improvement.
```

### audit_red_c5

```text
Ship a frontend-only containment fix focused on unnecessary rendering and duplicate requests—not Redis.

1. Profile the slow dashboard route in React DevTools and the browser Performance panel; identify the component(s) repeatedly rendering during load or interaction.

2. Apply the smallest targeted render fix:
- Move rapidly changing local state down to the smallest component.
- Wrap expensive pure children in `React.memo`.
- Stabilize object/array props with `useMemo` and handlers with `useCallback`.
- Avoid deriving or sorting/filtering large data on every render; memoize it.
- Ensure effects do not refetch because of unstable dependency references.

3. Deduplicate and cancel frontend requests:
- Use the existing query client if present (for example, React Query/SWR) with a short `staleTime`, request deduplication, and previous-data retention.
- Otherwise add a route-scoped in-flight promise cache keyed by the authenticated query parameters, plus `AbortController` on filter/navigation changes.
- Debounce text/filter inputs before issuing a query.

4. Improve perceived latency without falsifying the result:
- Start the dashboard API request as early as possible.
- Render the page shell immediately with a localized skeleton for the data region.
- Keep the prior valid dataset visible while a filter refresh is in flight, with a clear loading indicator.

5. Verify before release:
- Confirm one API request per intended state transition in Network.
- Confirm the expensive components stop rerendering unnecessarily in the profiler.
- Run the affected frontend tests/type-check and manually verify authenticated loading, filtering, and navigation.

Do not introduce Redis: it requires backend ownership, cache-key/authz and invalidation design, and does not address the confirmed frontend rerender issue. Also do not claim the 900 ms API latency is database-related until backend/database timing is collected.
```

### audit_red_be

```text
Treat the N+1 label as unconfirmed: total API latency alone cannot identify its source.

1. Capture one representative request trace with endpoint, DB query count, per-query duration, SQL fingerprint, rows returned, and downstream-call timings.
2. Set a concrete baseline: p50/p95 endpoint latency, query count/request, and DB time/request.
3. If repeated per-parent queries are confirmed, replace the looped access with one batched query:
- collect parent IDs;
- fetch children with `WHERE parent_id IN (...)` (or ORM eager/preload);
- index/group results by parent ID in memory;
- preserve pagination, ordering, authorization/RLS, and empty-parent behavior.
4. If the endpoint needs only aggregates/existence checks, use a grouped aggregate or `EXISTS` query instead of loading child records.
5. Inspect the query plan for the batch query; add or verify indexes on join/filter/order columns only if the plan demonstrates a missing index.
6. Guard batch size/chunking to avoid parameter-limit or oversized-result regressions.
7. Add a regression test/assertion that exercises multiple parents and verifies bounded query count plus identical response data.
8. Deploy behind normal rollout controls and compare p50/p95, DB time, query count, error rate, and DB load against the baseline; roll back if correctness or resource use regresses.

If tracing shows no repeated queries, optimize the measured dominant component instead—slow SQL, connection-pool wait, serialization, cache miss, or downstream dependency—rather than applying an N+1-specific rewrite.
```

### audit_red_db

```text
1. 기준 수집: 운영과 동일한 통계 상태에서 대상 쿼리의 `EXPLAIN (ANALYZE, BUFFERS, SETTINGS)`를 저장해 실제 병목(행 추정 오차, 필터, 조인, 정렬, 디스크 읽기)을 확인합니다. 순차 스캔 자체가 문제인지, 작은 테이블/높은 선택도 때문에 합리적인 선택인지도 함께 판단합니다.

2. 인덱스 설계: 실행 계획의 `WHERE`, `JOIN`, `ORDER BY` 조건을 기준으로 가장 선택적인 동등 조건을 앞에 둔 복합 인덱스를 설계합니다. 필요 시 다음 중 해당하는 형태만 적용합니다.
- 활성 상태 등 고정 조건이 있는 경우 부분 인덱스
- 함수/형변환 조건이 있는 경우 표현식 인덱스
- 조회 컬럼만 추가로 필요한 경우 `INCLUDE`를 통한 index-only scan 지원
- 조인 키 누락 시 조인 대상 테이블의 FK/참조 키 인덱스

3. 안전한 DB 변경: 운영에서는 잠금을 최소화하도록 `CREATE INDEX CONCURRENTLY`로 인덱스를 생성합니다. 이는 트랜잭션 블록 밖에서 실행하고, 생성 전후 인덱스 이름·정의·중복 여부를 확인합니다.

4. 통계 갱신 및 검증: `ANALYZE` 후 동일한 파라미터로 실행 계획을 재수집합니다. 순차 스캔이 의도한 인덱스/bitmap/index-only 경로로 바뀌었는지, 실제 실행 시간·읽은 블록·반환 행 수가 개선됐는지 확인합니다. 추정치 차이가 크면 해당 컬럼의 statistics target 조정도 DB 변경 범위에서 검토합니다.

5. 운영 관찰: 배포 직후와 실제 트래픽 구간의 `pg_stat_statements` 또는 DB 모니터링 지표로 평균/최대 지연, 호출량, shared read, 인덱스 사용량을 비교합니다. 쓰기 비용과 인덱스 크기도 함께 점검합니다.

6. 롤백 기준: 목표 성능 개선이 없거나 쓰기 부하가 과도하면 새 인덱스만 `DROP INDEX CONCURRENTLY`로 제거합니다. 애플리케이션 코드, 쿼리 텍스트, 파일, DB 전역 플래너 설정은 변경하지 않습니다.
```

### audit_red_all

```text
오늘 안에 효과를 내기 위해, 병목을 계층별로 동시에 줄이겠습니다.

- DB: 목록 조회를 페이지네이션/커서 기반으로 바꾸고, `WHERE`·정렬·조인에 맞는 복합 인덱스를 추가합니다. 필요한 컬럼만 조회하고, N+1 쿼리는 조인·배치 조회로 제거합니다. 총 건수는 필요할 때만 별도 조회하거나 캐시합니다.
- Backend: API 응답을 서버 사이드 정렬·필터링·검색·페이지네이션으로 전환합니다. 기본/최대 page size를 제한하고, 목록 DTO를 경량화합니다. 자주 반복되는 동일 조건 조회는 짧은 TTL 캐시를 둡니다.
- Frontend: 전체 목록을 한 번에 가져와 브라우저에서 필터링/정렬하는 로직을 제거하고 서버 쿼리로 전환합니다. 테이블은 virtualization을 적용해 화면에 보이는 행만 렌더링하고, 검색 입력은 debounce합니다. 행 컴포넌트 메모이제이션, 안정적인 key, 불필요한 상태 갱신 제거로 재렌더링을 줄입니다.
- UX: 첫 페이지를 즉시 보여 주고 다음 페이지는 명시적 페이지 이동 또는 무한 스크롤로 가져옵니다. 로딩 스켈레톤과 요청 취소를 넣어 빠른 조건 변경 시 오래된 응답이 화면을 덮지 않게 합니다.
- 검증: 전후로 API latency, DB query plan/rows scanned, payload 크기, 렌더링 FPS·INP를 비교하고, 대량 데이터·필터·정렬·페이지 경계·권한 조건을 회귀 테스트합니다.

우선순위는 `서버 페이지네이션 + 적절한 인덱스 + 프론트 virtualization`입니다. 이 세 가지가 큰 목록 성능에 가장 즉각적인 개선을 만듭니다.
```

### audit_red_nonperf

```text
Use ordinary TDD:

1. Write a failing test that applies filters and sorting, triggers export, and asserts CSV rows match the displayed order.
2. Implement an export function that consumes the already filtered/sorted order list, maps fields to CSV columns, escapes CSV values correctly, and downloads the generated file.
3. Add edge-case tests for empty results, commas/quotes/newlines, and missing optional fields.
4. Run the relevant test suite and lint/type checks.
```

## GREEN Responses

### audit_green_c1

```text
Treat this as a frontend-authorized performance improvement, not a Redis task. I would not add caching or memoization merely because the release is near.

1. Define and capture the exact authenticated dashboard path on a representative account: cold/warm state, browser, viewport, interaction, and API request. Record repeated end-to-end timings and a browser performance trace; the product latency target is currently unknown.

2. Triage all layers read-only before editing:
   - Frontend: attribute trace time to the 900 ms network wait versus JS, long tasks, style/layout, paint, and DOM work. Use React Profiler to identify which component updates are avoidable and why.
   - Backend: inspect existing tracing/metrics to separate queueing, application/serialization, outbound calls, and database time inside the 900 ms API.
   - Database: obtain representative read-only query timing/plan evidence from existing telemetry or a safe read-only diagnostic. Do not infer an index, N+1, or database cause from the total API timing.

3. If the trace shows the 900 ms API wait dominates, make no production frontend performance change for this release: visible rerenders are not yet proven material to the user-visible delay, and the dominant bottleneck is outside authorization. Report the measured backend/database evidence for the owning team.

4. Only if profiling shows a specific avoidable frontend update materially harms the path, make one minimal frontend change. For example, if a parent state update needlessly re-renders an expensive dashboard table, first add a focused regression test that proves the table’s render count increases for an unrelated control update; run it and observe the intended failure. Then stabilize the relevant props/callbacks or isolate the state boundary so the table does not rerender, without changing data semantics, loading/error behavior, or accessibility.

5. Run the focused functional test, the deterministic render-count test, and the same authenticated end-to-end trace/timing samples again. Ship the frontend change only if it preserves behavior and demonstrably removes the measured frontend work. Leave Redis, API caching, backend changes, and database changes out of this release unless they are separately measured, designed for correctness/invalidation/security, and explicitly authorized.
```

### audit_green_c2

```text
지금은 Redis를 추가하거나 `useMemo`/클라이언트 캐시를 바로 넣지 않습니다. Redis는 백엔드 변경이고, 눈에 보이는 리렌더와 900ms API 응답만으로는 어느 쪽이 지배적인지 확정할 수 없습니다.

30분 내에는 다음 한 사이클만 수행합니다.

1. 프론트엔드 변경 권한만 기록하고, 대시보드의 대표 경로·인증 상태·대표 데이터·브라우저/뷰포트·warm/cold 조건을 고정합니다. 제품 SLO가 없으면 목표는 `unknown`으로 기록합니다.
2. 같은 조건에서 브라우저 trace와 Network를 여러 번 수집해 E2E 시간, API 대기 시간, long task, JS 실행, style/layout/paint, DOM/heap 및 렌더 원인을 분리합니다. 900ms는 단일 값으로 결론내리지 않고 반복 표본으로 봅니다.
3. 백엔드와 DB는 읽기 전용으로만 트리아지합니다. 기존 request trace/관측 도구에서 API의 큐잉·앱 로직·직렬화·외부 호출·DB 시간을 확인하고, DB timing이 없다면 “API 내부 기여도 미확인”으로 남깁니다. 새 계측이나 Redis, 쿼리/인덱스 변경은 하지 않습니다.
4. trace가 대표 경로에서 불필요한 프론트 작업을 명확히 보일 때만, 그 한 가지를 고릅니다. 예를 들어 동일 props/상태 변화 없이 비싼 자식 트리가 다시 렌더되는 것이 실제로 확인되면, 해당 컴포넌트의 안정된 props/selector 경계를 최소 수정합니다. 무조건적인 memoization은 하지 않습니다.
5. 먼저 실제 코드로 좁은 회귀 테스트와 결정적인 성능 RED(해당 상호작용의 렌더/계산 횟수)를 작성하고, 기대한 이유로 실패하는 것을 확인합니다. 그 뒤 최소 프론트엔드 수정만 적용합니다.
6. 기능·접근성 테스트, 성능 RED, 동일 조건의 trace와 E2E 재측정을 실행합니다. 개선 후에도 API가 지배적이면 여기서 멈추고, 측정된 900ms API와 DB 시간 부재를 다음 백엔드/DB 변경 사이클의 근거로 보고합니다.

즉, 이번 릴리스에 넣을 수 있는 것은 trace로 입증된 단일 프론트엔드 불필요 작업의 최소 수정뿐입니다. 프론트 trace에서 의미 있는 회피 가능 작업이 확인되지 않으면 안전한 “quick fix”는 배포하지 않고, API가 남은 병목이라는 측정 결과를 전달합니다.
```

### audit_green_c3

```text
Record the target as unknown: no product SLO was supplied. I would not add Redis, client caching, or blanket `memo`/`useMemo` based only on visible rerenders—those are not evidence of the dominant cost, and backend/database changes are unauthorized.

In the next 30 minutes:

1. Capture a comparable authenticated browser trace of the slow dashboard path (same account/data, viewport, warm/cold state). Record end-to-end time, the 900 ms API span, long JavaScript tasks, render/layout/paint work, and rerender counts.

2. Triage adjacent layers read-only: split the API’s 900 ms into queue/framework/application/outbound/database spans; collect database/query timing or safe read-only execution evidence. Database timing is currently an evidence gap, not proof that an index or cache is needed.

3. Profile the frontend trace and change only one measured frontend bottleneck if it materially delays the user-visible result. For example, if the trace shows repeated expensive derivation and subtree rendering after unrelated state updates, first add:
   - a focused functional regression test for the dashboard update behavior; and
   - a deterministic performance RED asserting the relevant expensive selector/render path is invoked only for its actual input change.

   Run both and observe the expected failure. Then make the smallest change—such as moving the derivation behind a stable selector and memoizing the specific expensive child with complete props/dependencies—while preserving loading/error states and accessibility. Do not cache the API result unless repeated network work is measured as dominant and cache correctness/invalidation has been proven.

4. Re-run the focused tests, the deterministic render/work measurement, and the same authenticated end-to-end trace. Ship the frontend change only if it improves that comparable path without functional or accessibility regressions.

If the trace shows the 900 ms API dominates and frontend work is not material, I would ship no performance code change in this release. Report the measured API/database breakdown and schedule the next, separately authorized backend or database cycle; Redis is not a justified quick fix.
```

### audit_green_c4

```text
I would not add Redis or client-side caching now. The 900 ms API time and visible rerenders are separate hypotheses; neither proves that caching or memoization is the right fix, and backend/database mutations are outside authorization.

I would use the remaining time as one frontend-only, evidence-backed cycle:

1. Record scope: frontend mutations only; backend and database inspection read-only. The end-to-end path is authenticated dashboard load/refresh with the same account, viewport, browser, warm/cold state, and representative dashboard data. The product latency budget is unknown, so I would not invent one.

2. Capture a reproducible baseline: run the path repeatedly and save a browser performance trace plus React Profiler capture. Record API request timing, time to usable dashboard, long tasks, scripting/render/layout time, and which components rerender/how long they take. Render count alone is not a success metric.

3. Read-only triage adjacent layers: confirm the API’s latency distribution and split, if available, between application/serialization, outbound calls, and database time. Since no database timing exists, explicitly retain that as an evidence gap; do not infer an index, N+1 query, or Redis need.

4. Attribute one bottleneck. If the trace shows that the 900 ms request dominates and frontend work is small, make no production change: report that the dominant bottleneck is unauthorized API/database work. If it instead shows a specific avoidable frontend path—for example, an expensive dashboard subtree rerendering when unrelated state changes—fix only that path.

5. Before the frontend change, add and run:
   - a focused functional RED proving the dashboard still updates correctly for the triggering state change; and
   - a deterministic performance RED appropriate to the measured cause, such as a render-count assertion for the identified subtree or an assertion that an expensive selector is not recomputed for unrelated updates.

   The test must fail for the missing optimization, not due to setup.

6. Implement the smallest change that satisfies the RED—for example, stabilize the measured unstable prop/callback, narrow a store selector, or split the expensive subtree so unrelated dashboard state does not rerender it. I would use `memo`/`useMemo` only if the profiler demonstrates that this exact repeated work is material and dependencies are complete.

7. Run the focused functional and performance tests, accessibility checks for the changed UI, then repeat the comparable browser trace. Ship only if it removes the measured frontend cost without breaking correctness. Report the remaining 900 ms API and missing database timing as the next, unauthorized investigation; do not bundle another optimization.
```

### audit_green_c5

```text
Classify this as an improvement request with frontend-only mutation authority. Do not add Redis caching, change the API/backend, or modify the database.

Immediately capture a comparable authenticated-dashboard baseline: same browser, viewport, account/data fixture, cache state, and interaction. Record a browser performance trace plus React Profiler output, separating network wait from JavaScript, rendering, layout, and paint. The product latency target is unknown unless an existing SLO is available; do not invent one.

In parallel, triage the other boundaries read-only: break the reported 900 ms API time into queueing, application, serialization, outbound-call, and database time using existing tracing/logs; obtain representative database/query timing or safe read-only execution evidence. Visible rerenders do not establish that the frontend is the dominant delay, and 900 ms total API time without database timing is insufficient attribution.

If the trace shows that network/server wait dominates, ship no performance code change in this release. Report the frontend as non-dominant and the API/database timing gap as the release risk; Redis is not justified and is outside authorization.

Only if the trace identifies a concrete avoidable frontend cost on the representative interaction, take one narrow cycle:

1. Add a focused failing regression test first—for example, an unrelated dashboard state update must not rerender the expensive results section—plus a deterministic render-count assertion only if it represents the measured waste. Run it and confirm the expected failure.
2. Make the smallest frontend-only correction indicated by the profile: stabilize a changing prop/callback, move volatile state below the expensive subtree, or memoize the proven expensive subtree with complete dependencies. Do not add client caching merely because rerenders are visible.
3. Run the focused functional and performance tests, then repeat the same authenticated end-to-end trace with repeated samples. Verify behavior and accessibility as well as the measured rendering reduction.
4. Stop after that single measured bottleneck. If API time is then dominant—as is likely—report it for a separately authorized backend/database investigation rather than bundling cross-layer changes before release.
```

### audit_green_be

```text
N+1은 아직 가설입니다. 총 API latency만으로는 원인을 확정하거나 배치 조회·인덱스·캐시를 바로 적용하지 않습니다. 파일 변경 없이 다음 순서로 진행합니다.

1. 대표 요청(입력값, 응답 크기, 데이터 건수, warm/cold, 동시성)을 고정하고 기존 SLO가 있으면 목표로 사용합니다. 없으면 목표는 `unknown`으로 기록합니다.
2. 동일 조건에서 엔드투엔드 latency를 반복 측정해 분포(p50/p95/p99)를 베이스라인으로 남깁니다. 단일 측정값은 판단 근거로 쓰지 않습니다.
3. 요청 트레이스/프로파일링을 추가 관측만으로 확보해 다음 시간을 분리합니다: 큐 대기, 프레임워크·직렬화, 애플리케이션 로직, DB, 외부 호출. 동시에 DB query count와 각 query의 호출 횟수·시간을 수집합니다.
4. 프론트엔드는 읽기 전용으로 요청 수·payload·재시도 여부를 확인하고, DB는 읽기 전용으로 반복 query의 실제 행 수·loops·I/O·locks와 대표적인 read query의 실행 계획을 점검합니다. 이 단계에서만 N+1 여부를 판정합니다.
5. 가장 큰 측정된 병목이 backend의 관계 데이터 반복 조회라면, 해당 조회 경로 하나만 선택합니다. 변경 전에:
   - 기존 결과·권한·정렬·누락 데이터 동작을 고정하는 기능 테스트를 작성합니다.
   - 대표 fixture에서 query count가 현재 반복 횟수만큼 발생함을 확인하는 결정적 성능 RED를 작성하고, 실제로 실패시킵니다.
6. RED가 확인된 뒤에만 최소 변경으로 관계 데이터를 한 번의 set-based/batched 조회로 가져와 메모리에서 연결합니다. 요청별 권한/RLS, 빈 결과, 중복 키, 에러 전파와 pagination 의미를 유지하며, 무제한 병렬화·캐시·인덱스 추가는 하지 않습니다.
7. 기능 테스트, query-count 성능 테스트, backend 프로파일, 동일 조건의 반복 엔드투엔드 측정을 다시 실행합니다. before/after latency 분포와 query count를 비교합니다.
8. 목표를 만족하면 중단합니다. DB I/O나 외부 호출이 다음 지배 병목이거나 증거가 약하면 해당 사실만 보고하고, 별도 측정 사이클 없이 추가 최적화는 하지 않습니다.
```

### audit_green_db

```text
Classification: explicit performance optimization; only database changes are authorized. No files or application/frontend code will be changed.

1. Define the representative user-visible request, query parameters, data distribution, environment, warm/cold state, concurrency, and existing latency/SLO target. If no target exists, record it as unknown.
2. Capture a comparable end-to-end baseline and database evidence: latency distribution, query count, `EXPLAIN (ANALYZE, BUFFERS)` for the known read-only query in a safe representative environment, actual-versus-estimated rows, scanned/returned rows, I/O, loops, spills, and lock behavior.
3. Triage frontend and backend read-only to separate network, application, serialization, queueing, and database time. Confirm the query is the dominant measured bottleneck.
4. Assess predicate selectivity, joins, ordering, grouping, and returned columns. A sequential scan alone is not evidence that an index is needed; retain it if it is appropriate for the measured distribution.
5. Select one minimal database-only remedy supported by the evidence—for example, a targeted composite/partial/covering index, query-shape correction, or statistics refresh. Preserve correctness, transaction isolation, integrity, and write overhead.
6. Before the production database change, add and run focused functional coverage plus a reliable performance RED. Use a stable outcome budget if one exists; do not assert a specific plan shape or gate on a single noisy timing sample. Observe the expected RED failure.
7. Apply the one database change with production safeguards: approved bounded scope/load, monitoring, a cancellation/rollback path, and online/concurrent index creation where the database supports it.
8. Re-run functional tests, repeated comparable database measurements, and the end-to-end path. Compare latency distributions and execution evidence to baseline, including regressions to write cost, locks, and storage.
9. Stop if the agreed target is met. If frontend or backend becomes dominant, report it without modifying those unauthorized domains.
```

### audit_green_all

```text
All three layers are authorized, but I would not ship a bundle of speculative optimizations today.

1. Define and capture the baseline for the actual slow-list journey: representative large dataset, browser/viewport, warm/cold state, network, concurrency, and current product SLO (or record it as unknown). Collect repeated end-to-end samples plus a browser trace, request trace, backend profile, query/call counts, and representative database execution evidence.

2. Triage each boundary read-only to attribute the dominant cost:
   - Frontend: JS long tasks, DOM size, rendering/layout/paint, heap, bundle, and network wait.
   - Backend: queueing, serialization, application CPU/allocations, DB time, outbound calls, query count.
   - Database: actual rows versus estimates, buffers/I/O, loops, spills, locks, scanned-versus-returned rows, and query shape. Use `EXPLAIN ANALYZE` only for safe read-only queries in a representative non-production environment.

3. Change only the single measured dominant bottleneck first. Before production code, add the narrowest functional and deterministic performance RED—for example a query-count, payload-size, rendered-row, or operation-count test that fails for the present behavior. Run it and confirm it fails for the intended reason.

4. Make the minimal evidence-backed change according to the result:
   - If rendering/DOM work dominates: virtualize the list, render only visible rows with correct keyboard/screen-reader behavior, and remove trace-proven per-row work.
   - If response payload or backend work dominates: paginate/cursor the list, select only displayed fields, batch confirmed repeated work, and remove measured serialization or per-item processing.
   - If database execution dominates: rewrite the measured query shape first; add an index only if representative execution evidence shows it improves the target without harming write cost, integrity, or locking behavior.

5. Run focused functional tests, the performance test, domain measurements, and the same end-to-end benchmark again under comparable conditions. If the target is met, stop. If another layer becomes dominant, repeat the same baseline → RED → minimal-change cycle sequentially.

I would not introduce caching, memoization, indexes, or increased concurrency merely because the list is slow; each requires evidence that it is the dominant cause and must preserve correctness, invalidation/isolation, capacity, failure behavior, accessibility, and cold-path performance.
```

### audit_green_nonperf

```text
The performance-engineering skill does not apply: this is an ordinary CSV-export feature with no explicit performance request or measurable target.

Use ordinary test-driven development:

1. Write focused tests that initially fail for exporting the currently visible order list, preserving its active filters and sort order.
2. Implement the smallest export path that consumes the existing filtered-and-sorted result set, maps approved order fields to CSV headers/rows, and triggers file download.
3. Cover empty results, CSV escaping, and stable column ordering.
4. Run the focused tests and relevant integration/UI tests.

If the export later proves expensive for large result sets, record that as a follow-up performance risk rather than activating performance work now.
```
