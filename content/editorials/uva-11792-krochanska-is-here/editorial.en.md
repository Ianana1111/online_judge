# Compare shortest-distance sums only among important stations

## Problem and constraints

Rail lines list consecutive bidirectional stations, each segment taking two hours and transfers costing nothing. A station is important when it occurs on at least two distinct lines. Among important stations, choose the one with minimum average shortest travel time to the other important stations; break ties by smaller ID. Secondary stations may be path intermediates but neither candidates nor average destinations.

## Building the approach

For every line, add undirected edges only between consecutive listed stations. Use a fresh per-line seen array when counting station appearances, so repetition within one line does not create false importance. Collect stations whose distinct-line count exceeds one.

Run BFS from each important candidate because every graph edge has equal time. Sum distances only to important stations. Multiplication by two and division by the common number of other important stations affect every candidate equally, so comparing raw distance sums is sufficient. Examine candidates by ID and update only on a strictly smaller sum to preserve the smallest tie.

## Walkthrough

If two lines meet only at station 2, it is the sole important station and must be selected, regardless of secondary layout. If a symmetric network gives two important candidates equal distance sums, the smaller station number wins independently of input order.

## Why it works

The constructed graph contains exactly legal adjacent train moves, and shared vertices represent free transfers, so graph paths match journeys. BFS returns minimum segment counts, proportional to minimum travel times. Per-line deduplication identifies exactly the specified important set. Every candidate uses the same positive scaling and denominator, making minimum sum equivalent to minimum average. Ordered strict updates implement the tie rule.

## Complexity

For `I<=100` important stations, total BFS time is `O(I(V+E))`; graph and working storage are `O(V+E)`.

## Common mistakes

- Averaging distances to every station.
- Allowing secondary stations to be candidates.
- Counting repeated occurrence within one line as multiple lines.
- Connecting all stations on one line directly instead of only adjacent ones.
- Choosing the larger tied ID or dividing by zero for one important station.
