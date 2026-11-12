# Work out what the recursion returns: every N ≤ 100 gives 91

## Problem and constraints

The input is a sequence of positive integers, each at most 1,000,000, with at most 250,000 of them, terminated by a 0 that is not processed. For each N, print `f91(N) = value`. The function is defined as N − 10 when N ≥ 101, and f91(f91(N + 11)) when N ≤ 100.

## Building the approach

Writing the recursion literally does produce correct answers, but every N ≤ 100 unfolds into many nested calls. It is better to understand the function first and then answer with a one-line formula.

The case N ≥ 101 is simply N − 10. For N ≤ 100, try a few values. f91(100) = f91(f91(111)) = f91(101) = 91, and f91(99) = f91(f91(110)) = f91(100) = 91. For N between 91 and 100, the inner call jumps above 100, subtracting 10 lands one step higher than where we started, and the chain climbs to 100 and finishes at 91.

For N below 91, the inner N + 11 is still at most 100, so it keeps climbing until it enters the 91..101 range, after which it collapses to 91 as well. So the answer is always 91 for N ≤ 100, and N − 10 for N ≥ 101.

With up to 250,000 inputs, the real cost is I/O: read everything at once and write the output in one go instead of flushing every line.

## Walkthrough

N = 500 is at least 101, so the answer is 490 and the line is `f91(500) = 490`. N = 91 is at most 100, so the answer is 91. Reading 0 stops the program without printing anything.

At the boundary, N = 100 gives 91 and N = 101 gives 101 − 10 = 91, so the two branches meet. N = 1,000,000 gives 999,990.

## Why it works

For N ≥ 101 the definition gives N − 10 directly. For 91 ≤ N ≤ 100, induct downward from 100: f91(100) = 91 was computed above, and if f91(N + 1) = 91 then f91(N) = f91(f91(N + 11)) = f91(N + 1) = 91, because N + 11 ≥ 102 makes the inner call equal N + 1. For N ≤ 90, N + 11 ≤ 101: if it is at most 100 the inner value is 91 by induction, and if it equals 101 the inner value is also 91; either way the outer call is f91(91) = 91. Hence every N ≤ 100 maps to 91.

## Complexity

Each query is O(1), so the total time is O(Q) with Q ≤ 250,000. The buffered output is a few megabytes at most, which is also the extra memory used.

## Common mistakes

- Using N < 100 as the boundary, which makes f91(100) wrongly 90.
- Printing a line for the terminating 0.
- Recursing literally and flushing with `endl` on every line, which is slow for 250,000 inputs.
- Dropping the spaces around `=` or misplacing the parentheses in the output format.
