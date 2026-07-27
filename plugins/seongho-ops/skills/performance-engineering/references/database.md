# Database Performance Guidance

Use representative data shape and inspect execution time, actual versus
estimated rows, loops, buffers, I/O, spills, locks, scanned versus returned
rows, selectivity, and application query count. `EXPLAIN ANALYZE` or an
equivalent execution plan is diagnostic evidence, not a required outcome.

Do not mandate index use or any fixed plan shape. A sequential scan and other
plan choices may be correct for the distribution. Do not use a brittle plan
assertion as the performance test; prefer stable outcome budgets where one
exists, query-count assertions where relevant, and integrity-preserving
functional tests.

Assess query and I/O shape before proposing an index, cache, batching, or other
change. Preserve data integrity, isolation, locks, correctness, and safe
failure behavior. Keep frontend and backend triage read-only unless authorized,
then verify one minimal database change against the comparable end-to-end path.
