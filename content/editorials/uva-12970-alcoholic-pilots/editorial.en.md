# Compare and average arrival times as exact rational numbers

## Problem and constraints

Two planes have positive speed `v` and distance `d`, so arrival time is `d/v`. Determine whether the first captain arrives earlier and print the arithmetic mean of both times as a reduced fraction, omitting `/1`. Inputs are at most one billion, no tie occurs, and four zeroes terminate input.

## Building the approach

Positive denominators let us compare `d1/v1 < d2/v2` by the exact integer inequality `d1*v2 < d2*v1`. Floating point is unnecessary and may merge extremely close legal values.

The mean is `(d1*v2+d2*v1)/(2*v1*v2)`. Compute both parts in 64 bits and divide them by their greatest common divisor. Print only the numerator when the reduced denominator is one.

## Walkthrough

Speed 2 over distance 4 takes time 2, while speed 1 over distance 3 takes time 3. The captain wins and the mean is `5/2`. Times `7/4` and `9/4` average to integer 2, which must be printed without a denominator.

## Why it works

Cross multiplication by positive speeds preserves inequality, so the winner test exactly matches the rational arrival times. Bringing both times to a common denominator and dividing by two yields the stated mean fraction. Dividing numerator and denominator by their gcd preserves the value and makes them coprime, producing the required canonical representation.

## Complexity

Each case uses constant arithmetic plus `O(log M)` Euclidean gcd time and `O(1)` space. Maximum intermediates below `2*10^18` fit signed 64 bits.

## Common mistakes

- Comparing speeds without considering distances.
- Performing integer division before comparison.
- Using `double` for nearly equal ratios.
- Forgetting the factor two in the average denominator.
- Multiplying in 32 bits before converting the result.
