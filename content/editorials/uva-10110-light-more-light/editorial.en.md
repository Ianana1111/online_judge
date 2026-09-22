# The final light is on exactly for a perfect square

## Problem and constraints

There are `n` initially off lights. On pass `i`, every light whose number is a multiple of `i` is toggled. After all n passes, determine whether light n is on. Values range from 1 through `2^32-1`; zero terminates input and is not processed. Output lowercase `yes` or `no`. Direct simulation is impossible near the upper bound.

## Building the approach

Light n is toggled exactly on passes whose indices divide n, so the number of toggles equals the divisor count of n. Divisors pair as `d` and `n/d`. Usually the two are distinct, contributing an even number. Only for a perfect square does the square root pair with itself, leaving one unpaired divisor and an odd total.

An initially off light ends on after an odd number of toggles. Therefore the task reduces to exact perfect-square testing.

Binary-search integer roots from 1 through 65,535, since `65,536^2=2^32` exceeds the legal maximum. Compare `mid^2` using unsigned 64-bit arithmetic to avoid signed overflow and floating square-root boundary errors.

## Walkthrough

Twelve has divisor pairs `(1,12)`, `(2,6)`, and `(3,4)`, giving six toggles and a final off state. Sixteen has factors 1,2,4,8,16; the root four is unpaired, so the light finishes on.

One is itself a perfect square and outputs `yes`. `65535^2=4294836225` is the largest square inside the permitted range and must also be accepted.

## Why it works

A pass toggles the target exactly when its number divides n, so parity of the divisor count determines the final state. The mapping `d -> n/d` pairs every divisor with a distinct partner except a fixed point satisfying `d^2=n`. Thus the count is odd exactly for perfect squares.

Binary search maintains all roots whose square might equal n. Comparing the safe exact square removes only impossible halves; equality proves square status, and exhausting the interval proves no integer root exists.

## Complexity

At most about sixteen binary-search comparisons are needed, or `O(log n)` time and `O(1)` space.

## Common mistakes

- Testing whether n itself is odd rather than its divisor count.
- Squaring roots in signed 32-bit arithmetic.
- Limiting roots to 46,340 and missing large unsigned squares.
- Skipping the final remaining binary-search candidate.
- Processing the zero sentinel as a square.
