# Frontend Performance Guidance

Measure the user-visible interaction and frame stability first. Use browser
traces to attribute time among network work, JavaScript execution, rendering,
long tasks, style recalculation, layout/reflow, paint, composite, DOM size,
heap use, and bundle size. Record the browser, viewport, fixture, interaction,
and warm/cold conditions.

Render count is a diagnostic measure, not an outcome by itself. Do not define a
universal reflow or repaint count as a success criterion, and do not choose
memoization or client caching from visible rerenders alone. Read-only triage of
backend and database timing remains required even when frontend is the only
authorized mutation domain.

Choose the smallest frontend change only after the trace identifies avoidable
work in the representative path. Verify functionality, accessibility, the
focused measure, and the comparable end-to-end result; report an adjacent
bottleneck without mutating it when it is outside authorization.
