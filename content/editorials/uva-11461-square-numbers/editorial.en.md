# Count precomputed squares between inclusive binary-search bounds

## Problem and constraints

For each closed interval `[a,b]`, count the perfect squares it contains. `1<=a<=b<=100000`, and `0 0` terminates input. Both endpoints count when they are squares, and an interval may contain none.

## Building the approach

Precompute `1^2,2^2,...,316^2` into a sorted array. For a query, `lower_bound(a)` points to the first square at least `a`, while `upper_bound(b)` points just after the last square at most `b`. Their iterator difference is the inclusive count.

This integer-only method avoids floating-point rounding near exact square roots. It also expresses the closed interval directly without endpoint special cases.

## Walkthrough

`[1,4]` contains 1 and 4, so the answer is 2. `[2,3]` has equal search positions and returns zero. For `[9,9]`, the first iterator points to 9 and the second to 16, giving one. At 100000, the largest included square is 99856.

## Why it works

The precomputed array contains exactly all positive squares within the query universe. Every element before `lower_bound(a)` is too small, and every element at or after `upper_bound(b)` is too large. Therefore the contiguous range between them consists exactly of squares satisfying `a<=x^2<=b`, and its length is the required count.

## Complexity

Precomputation takes `O(sqrt U)` time and space for `U=100000`. Each query performs two binary searches in `O(log sqrt U)` time.

## Common mistakes

- Using `lower_bound` for the right endpoint and excluding a square equal to `b`.
- Using `upper_bound` for the left endpoint and excluding a square equal to `a`.
- Counting the next square above `b`.
- Assuming every interval contains a square.
- Processing the terminating `0 0` as a normal interval containing zero.
