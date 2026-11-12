# Fold station fees into Dijkstra's edge weights and round the fare with exact integers

## Problem and constraints

Each map has fewer than 20 stations, each with a fee, and fewer than 20 two-way roads; oil costs 2 taka per kilometer. Each query gives a start, a destination and a passenger count. Find the cheapest route, print its stations, and print each passenger's fare: cost × 1.1 ÷ passengers, rounded to two decimal places. A route's cost is the sum of the fees of every station on it, including both ends, plus 2 × its total length. The cheapest route is guaranteed to be unique. Print a blank line between consecutive maps.

## Building the approach

This is a shortest-path problem where cost comes from both edges (oil) and vertices (station fees). Folding the vertex fee into the edge lets ordinary Dijkstra work: moving from x to y costs 2 × distance + fee(y), and the start's fee is the initial cost. Each station on a route then contributes its fee exactly once.

With fewer than 20 stations, the simple O(n²) Dijkstra is enough: each round picks the cheapest unfinished station and relaxes its neighbors. There may be several roads between the same pair of stations, so only the shortest is kept. Relaxation records `prev[y] = x`; walking `prev` back from the destination and reversing gives the route to print. Because the cheapest route is unique, the recorded one is the answer.

The fare rounding is the other trap. The cost is an integer, and the fare in cents is cost × 110 ÷ passengers. Computing in floating point and printing with `%.2f` can round the wrong way at an exact 0.005 because of binary representation. Integer arithmetic avoids this: cents = (cost × 220 + passengers) ÷ (2 × passengers), which adds one half and truncates, giving an exact result that is then printed as whole units and two digits.

## Walkthrough

In the first map, query mirpur12 to gulistan with 30 passengers. The route mirpur12 → farmgate → gulistan has fees 5 + 8 + 10 = 23 and length 12 + 10 = 22 km, so oil is 44 and the cost is 67. The alternative mirpur12 → newmarket → gulistan has fees 5 + 5 + 10 = 20 and 28 km, oil 56, total 76, which is more expensive. The fare is 67 × 110 ÷ 30 = 245.67 cents, which rounds to 246, printed as 2.46.

The second query, to newmarket, costs 5 + 5 + 40 = 50, and 50 × 110 ÷ 30 = 183.3 cents, printed as 1.83.

## Why it works

For any route v₀, v₁, …, vₖ, the accumulated weight is fee(v₀) + Σ(2 × distance + fee(vᵢ)), exactly the route cost defined in the statement, so the cheapest route is the shortest path in this weighted graph. All weights are non-negative, so Dijkstra computes each station's minimum cost correctly; `prev` is updated only on a strict improvement, so the destination's `prev` chain is a minimum-cost route, which the statement guarantees is unique. In the fare formula, the floor of (cost × 220 + p) ÷ (2p) equals ⌊cost × 110 / p + 1/2⌋, which is rounding to the nearest cent.

## Complexity

Each query runs an O(n²) Dijkstra with n < 20, and each map has at most 9 queries, so the total time is O(maps × 9 × n²), which is tiny. The distance matrix uses O(n²) space.

## Common mistakes

- Leaving out the fee of the start or the destination.
- Forgetting to multiply kilometers by 2.
- Printing a floating-point fare with `%.2f` and rounding the wrong way at exactly 0.005.
- Not keeping the minimum of parallel roads, or overwriting it with the last road read.
- Missing the blank line between maps, or printing an extra one after the last map.
- Printing the route from destination to start without reversing it.
