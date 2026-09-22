# Simulate each day's events exactly with scaled integers

## Problem and constraints

Each day the snail climbs during daylight and slides at night. Its first climb is `U`; every later day's ability decreases by the fixed amount `U*F/100`, never becoming a negative climb. It succeeds only when daylight height is strictly above well height `H`, and fails only when nighttime height is strictly below zero. Inputs are integers from 1 through 100, with `H = 0` ending input.

## Building the approach

Fatigue is a constant fraction of the original `U`, not a percentage of the remaining ability. Scale all distances by 100: initial climb is `100U`, daily loss is `UF`, and nightly slide is `100D`. This removes floating-point boundary uncertainty.

For each day, add `max(0, climb)`, check success, subtract the nightly slide, check failure, then reduce the ability for the next day. Touching `H` is not success, and touching zero is not failure. A successful snail does not slide again that night.

## Walkthrough

For `H=6,U=3,D=1,F=10`, daylight heights are 3, 4.7, and 6.1, so success occurs on day three before sliding. For `H=1,U=1,D=1,F=1`, day one reaches exactly 1 and later exactly 0, satisfying neither strict condition; failure occurs after the second night's slide.

## Why it works

Scaling by 100 represents every possible state exactly because all inputs are integers and the only fraction has denominator 100. Inductively, at each morning `height` and `climb` equal the true scaled state. The simulation applies the same nonnegative climb, success check, slide, failure check, and fixed fatigue update in the problem's order. Thus the first boundary crossing and its day are reported correctly.

## Complexity

If the process lasts `D_s` days, time is `O(D_s)` and extra space is `O(1)`. Positive fatigue eventually reduces climbing to zero, after which nightly sliding guarantees termination.

## Common mistakes

- Applying the fatigue percentage to the remaining ability each day.
- Allowing a negative daytime climb.
- Using `>=` for success or `<=` for failure.
- Sliding before checking daytime success.
- Applying fatigue before the first climb.
