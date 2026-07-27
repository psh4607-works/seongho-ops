# Measurement Guidance

Before selecting an optimization, write down the user-visible end-to-end path,
representative fixture and data shape, environment and configuration, metric,
and product budget or SLO. Keep browser, hardware, runtime, dependency state,
warm/cold state, concurrency, network, and background load comparable. If no
existing target exists, record it as unknown rather than inventing a threshold.

## Baseline and RED

Capture an end-to-end baseline first. When the real path cannot be measured,
choose the smallest bounded proxy that preserves the suspected work and report
what it cannot prove.

Use deterministic behavior measures—such as query, call, render, allocation,
payload-byte, or operation counts—as blocking RED tests only when they represent
the requirement. For noisy wall-clock measures, control confounders, collect
repeated samples, compare distributions or a documented statistical summary,
and keep a single sample out of blocking CI.

## Compare and Stop

Profile before changing code. Compare before and after under comparable
conditions, including functional correctness and the end-to-end path. Attribute
the dominant contribution before choosing one bottleneck for the cycle.

Stop when the agreed target is met. Also stop and report when the next dominant
bottleneck is unauthorized, data is not representative, the evidence is too
weak to attribute a cause, or the proposed change would compromise correctness,
integrity, security, accessibility, or required cold-path behavior.
