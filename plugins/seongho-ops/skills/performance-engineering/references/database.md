# Database Performance Guidance

Use representative data shape and inspect execution time, actual versus
estimated rows, loops, buffers, I/O, spills, locks, scanned versus returned
rows, selectivity, and application query count. `EXPLAIN ANALYZE` or an
equivalent execution plan is diagnostic evidence, not a required outcome.

`EXPLAIN ANALYZE` executes the statement. Restrict it to known read-only
statements in a safe representative environment. For writes, use non-executing
plans, or run only with explicitly authorized controlled rollback. In live
production, apply impact controls: approval, bounded scope and load, monitoring,
and a stop or cancel condition before collecting execution evidence.

Do not mandate index use or any fixed plan shape. A sequential scan and other
plan choices may be correct for the distribution. Do not use a brittle plan
assertion as the performance test; prefer stable outcome budgets where one
exists, query-count assertions where relevant, and integrity-preserving
functional tests.

Assess query and I/O shape before proposing an index, cache, batching, or other
change. Preserve data integrity, isolation, locks, correctness, and safe
failure behavior. Keep frontend and backend triage read-only unless authorized,
then verify one minimal database change against the comparable end-to-end path.
