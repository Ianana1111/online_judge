# Compare the directed request multiset with its reversal

## Problem and constraints

Each student requests an exchange from location `A` to different location `B`. Every student must pair with a distinct student requesting `B` to `A`. A case has up to 500000 students and may contain repeated identical requests. Zero students terminates input.

## Building the approach

The requirement concerns multiplicities of directed pairs, not only whether a reverse direction exists. Store every request `(A,B)` in `forward` and its reversal `(B,A)` in `backward`. Sort both vectors and compare them element by element.

Equality means every directed pair occurs exactly as many times as its reverse, so all students can be paired. Do not replace pairs by `(min,max)` or a set, because that destroys direction or multiplicity.

Balancing total departures and arrivals at each location is insufficient: a directed cycle `A->B`, `B->C`, `C->A` balances cities but offers no direct reciprocal partners.

## Walkthrough

Requests `1->2`, `1->2`, and `2->1` fail because one of the first two students remains unmatched. Adding another `2->1` makes both directed multiplicities equal.

Requests `1->2`, `2->3`, and `3->1` still fail despite balanced location totals.

## Why it works

If a complete pairing exists, every paired couple contributes one `(A,B)` and one `(B,A)`, so the original request multiset equals its reversal.

Conversely, if the multisets are equal, each directed pair has the same number of students as its reverse. Pair those two groups arbitrarily one-to-one. Groups for different directed pairs are disjoint, so no student is reused. Thus multiset equality is both necessary and sufficient, and sorted vector equality tests it exactly.

## Complexity

Sorting takes `O(N log N)` time and the two vectors use `O(N)` space.

## Common mistakes

- Using a set and losing repeated request counts.
- Checking only per-location arrivals and departures.
- Canonicalizing endpoints and erasing direction.
- Assuming mere existence of a reverse request handles all students.
