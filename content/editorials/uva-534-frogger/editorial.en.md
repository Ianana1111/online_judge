# Replace path sums with maximum jumps in minimax Dijkstra

## Problem and constraints

Among `2 <= N <= 200` stones, travel from the first to the second, possibly through others. A path's cost is its largest single jump. Minimize that maximum, rather than total distance. Coordinates are integers from 0 to 1000, input ends with `N = 0`, and output uses three decimal places with scenario formatting.

## Building the approach

Let `best[v]` be the smallest known squared bottleneck from stone zero to `v`. Initialize the source to zero and all others to infinity. Repeatedly select the unused vertex `u` with minimum `best`, then consider traveling through it to every unused `v`.

Extending the path changes its bottleneck to

`max(best[u], squaredDistance(u,v))`.

Use this value when it improves `best[v]`. This is Dijkstra under minimax path composition: alternatives still take a minimum, but a path extension takes a maximum rather than a sum. Because square root is increasing, all comparisons remain exact integer squared distances; take one square root only for final output. Stop when vertex one becomes settled.

## Walkthrough

From `(17,4)` to `(19,4)`, the direct jump is 2. Going through `(18,5)` uses two jumps of `sqrt(2)`. Its total traveled length is larger, but its largest jump is smaller, so the frog distance is `1.414`. Ordinary shortest-path addition would optimize the wrong quantity.

## Why it works

Suppose the unsettled vertex `u` with smallest `best` had a path with a smaller bottleneck. On that path, take the first unsettled vertex `v`; its predecessor was already settled and would have relaxed `v` to no more than that path bottleneck. Then `v` would have a value smaller than the selected `u`, a contradiction. Thus each selected value is final. The max-based relaxation evaluates exactly the bottleneck of every extension, so the settled value for stone one is the minimum possible maximum jump.

## Complexity

Linear selection and relaxation over the complete graph take `O(N^2)` time and `O(N)` extra space. Squared distances fit safely in `long long`.

## Common mistakes

- Adding edge weights and finding minimum total distance.
- Considering only the direct jump between the first two stones.
- Minimizing the smallest edge instead of the largest edge on a path.
- Returning a result for every stone rather than stone one.
- Omitting scenario labels, three decimals, or the blank line.
