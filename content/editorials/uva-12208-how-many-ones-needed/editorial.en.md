# Count set bits over an interval through per-position cycles

## Problem and constraints

For `0 <= a <= b <= 2,000,000,000`, count all one bits in the binary representations of every integer in the inclusive interval `[a,b]`. Up to 11,000 queries are followed by the sentinel `0 0`. Iterating over the interval is too slow, and the total requires 64-bit arithmetic.

## Building the approach

Define `prefix(n)` as the number of one bits among all integers from zero through `n`, with `prefix(n)=0` for negative `n`. The query answer is `prefix(b)-prefix(a-1)`.

For a bit of value `p`, consecutive integers repeat a cycle of `p` zeroes followed by `p` ones. Among the `n+1` integers in a prefix, each full cycle contributes `p` ones. If the remaining length is `r`, it contributes `max(0,r-p)` additional ones. Sum this formula for `p=1,2,4,...` while `p<=n`.

## Walkthrough

From 5 through 10, the binary values have `2,2,3,1,2,2` one bits, totaling 12. For zero through seven, each of the lowest three bit positions is one exactly four times, also totaling 12. The cycle calculation reaches the same result without visiting individual integers.

## Why it works

At each bit position, binary counting produces exactly the stated alternating zero and one blocks. Full cycles and the remaining prefix therefore count every occurrence of that bit precisely. Each one bit belongs to one unique number and position, so summing positions neither duplicates nor omits any occurrence. Subtracting the prefix ending at `a-1` leaves exactly `[a,b]`, including `a=0` through the negative-prefix definition.

## Complexity

Each prefix examines `O(log n)` bit positions and uses `O(1)` extra space. A query performs two such calculations. All counters and products use 64-bit integers.

## Common mistakes

- Using `n` rather than `n+1` as the prefix length.
- Subtracting `prefix(a)` and losing the lower endpoint.
- Accumulating the answer in 32 bits.
- Processing `0 0` as a real query.
- Adding a negative remainder contribution before the one block begins.
