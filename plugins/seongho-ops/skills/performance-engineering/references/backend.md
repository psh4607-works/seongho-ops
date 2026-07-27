# Backend Performance Guidance

Separate queueing, framework and serialization work, application logic,
database time, and outbound calls in the representative end-to-end path.
Measure latency distributions, throughput, CPU, memory, allocations, event-loop
or thread blocking, query count, call count, and relevant concurrency rather
than relying on a single total-latency observation.

Treat N+1 as a hypothesis, never a conclusion from code shape. Confirm each
candidate contribution with profiles, traces, instrumentation, or equivalent
representative evidence before changing it. Bounded concurrency is not a default
solution: establish that blocking or queueing dominates, then preserve limits,
backpressure, correctness, and failure behavior.

Keep frontend and database inspection read-only unless authorized. After one
minimal backend change, run focused functional tests, the domain measurement,
and the comparable end-to-end path before selecting another bottleneck.
