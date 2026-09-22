# Detect zero or a repeated complete state under simultaneous differences

## Problem and constraints

For a circular vector of 3 through 15 nonnegative integers, replace every entry simultaneously by the absolute difference from its next neighbor, with the final entry comparing to the first. Print `ZERO` if the process reaches the all-zero vector, otherwise `LOOP` when a nonzero state repeats. The input guarantees one occurs within 1,000 steps.

## Building the approach

Store every seen complete vector in a set. At each iteration, check all-zero first. Otherwise insert the vector; a failed insertion proves repetition and therefore a loop.

Compute the next vector separately from the unchanged old state. In-place updates would make later differences mix current and previous rounds. Use `(i+1)%n` for circular wraparound.

## Walkthrough

State `(1,1,1)` becomes `(0,0,0)` and reports ZERO. Starting `(1,0,0)` visits `(1,0,1)`, `(1,1,0)`, `(0,1,1)` and eventually repeats a nonzero state, so it reports LOOP. An initially zero vector stops immediately.

## Why it works

Separate construction exactly implements all simultaneous circular differences. Reaching all zero directly satisfies the first outcome. The transition is deterministic, so repeating a nonzero complete state makes every future state repeat the same trajectory. Any zero on that cycle would already have been detected before insertion, so repetition safely means LOOP.

## Complexity

For S visited states of length n, an ordered set uses `O(Sn log S)` comparison time and `O(Sn)` space; here `S<=1000` by the problem guarantee.

## Common mistakes

- Updating entries in place.
- Failing to wrap the last entry to the first.
- Comparing only sums or sorted vectors.
- Treating any single zero entry as all zero.
- Testing repetition before zero and misclassifying zero.
