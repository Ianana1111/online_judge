# Translate the story into a nonnegative difference

## Problem and constraints

For every pair of army sizes, print the difference between the larger and the smaller size. Either size may appear first. The platform permits values from zero through 2³², inclusive, and input ends at EOF. In particular, `0 0` is a valid case whose answer is zero.

## Building the approach

The story can make it tempting to assume the larger army always appears second. The input format does not promise that order. Express the requested quantity directly as `max(a, b) - min(a, b)`; then the answer is nonnegative regardless of the order.

The arithmetic is simple, but choosing a type is part of solving the problem. The endpoint 2³² is 4,294,967,296. It exceeds both a signed 32-bit integer's maximum and an unsigned 32-bit integer's maximum. Reading into a narrow variable and converting afterward cannot repair an overflow that already happened. Use 64-bit integers for the input and subtraction from the beginning.

There is no need for floating-point arithmetic, a case counter, or an array. Read one pair, print one answer, and repeat.

## Walkthrough

Both `10 12` and `12 10` produce 2. Equal inputs produce zero. At the boundary, `0 4294967296` produces 4,294,967,296, which demonstrates why a 32-bit type is insufficient even though the algorithm contains only one subtraction.

## Why it works

The two selected operands are exactly the larger and smaller army sizes. Subtracting the smaller from the larger gives their absolute difference and cannot be negative. A signed 64-bit integer represents every allowed input and every possible result, so the computation remains exact.

## Complexity

O(1) time and space per pair; O(Q) time for Q pairs.

## Common mistakes

- Assuming the second number is always larger.
- Using a 32-bit unsigned type despite the inclusive upper endpoint.
- Converting to a wider type only after reading or subtracting.
- Stopping at `0 0` or reading an initial case count that does not exist.
