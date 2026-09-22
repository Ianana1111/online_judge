# Use weighted interval scheduling over advertisement floors

## Problem and constraints

Each advertisement occupies floors `A` through `A+B-1` and earns profit `C`. Ads are indivisible and no two selected ads may share a floor. Choose ads maximizing total profit, with up to 30,000 intervals. Representing coverage as half-open `[A,A+B)` makes touching boundaries nonoverlapping.

## Building the approach

Sort ads by increasing end and let `best[i]` be maximum profit among the first `i` ads. For current ad, either skip it and keep `best[i-1]`, or choose it. In the chosen case, previous ads must end at or before its start. Binary-search the sorted end array with `upper_bound(start)` to obtain the number `compatible` of such earlier ads, then use `best[compatible]+profit`.

Ordinary earliest-finish greedy is insufficient because profits differ, and highest-profit-first can block several compatible ads with greater combined value.

## Walkthrough

Ads `[0,2)` worth 10 and `[2,4)` worth 10 may coexist and beat `[0,4)` worth 19. The first occupies floors 0 and 1 while the second begins at 2, so equality of end and next start must be compatible; this is why the search uses `upper_bound`.

## Why it works

In any optimal solution considering the first `i` ads, the final sorted ad is either absent, giving the previous prefix optimum, or present. If present, every other chosen ad lies inside its compatible prefix; replacing those ads by `best[compatible]` cannot hurt. The recurrence takes the better of these exhaustive disjoint cases, so induction from `best[0]=0` proves global optimality.

## Complexity

Sorting and `N` binary searches take `O(N log N)` time. Arrays use `O(N)` space.

## Common mistakes

- Treating `B` as the ending floor rather than length.
- Requiring predecessor end to be strictly below the next start.
- Choosing only the single highest-profit ad.
- Applying unweighted interval greedy.
- Searching among later, not-yet-computed ads.
