Fatigue is a constant fraction of the original `U`, not a percentage of the remaining ability. Scale all distances by 100: initial climb is `100U`, daily loss is `UF`, and nightly slide is `100D`. This removes floating-point boundary uncertainty.

For each day, add `max(0, climb)`, check success, subtract the nightly slide, check failure, then reduce the ability for the next day. Touching `H` is not success, and touching zero is not failure. A successful snail does not slide again that night.

Climb and check success before sliding and checking failure; fatigue changes only the next day’s climb.
