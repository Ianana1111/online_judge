# Binary-search the maximum daily walk and greedily count days

## Problem and constraints

`N` campsites divide the route into `N+1` nonnegative-distance segments. Spend exactly `K` nights, giving `K+1` days, and minimize the maximum distance walked in one day. Here `N <= 600`, `K <= 300`, and cases continue to EOF. This platform permits extra nights at an existing campsite with zero walking, so `K>N` remains valid.

## Building the approach

Binary-search a candidate daily limit `L`. It cannot be below the longest indivisible segment; total distance is always a feasible upper bound. To test `L`, scan segments in order and keep adding to the current day until the next segment would make the sum strictly exceed `L`; then start a new day. This greedy packing uses the minimum days possible under that limit.

The limit is feasible when greedy days are at most `K+1`. Extra days may be introduced by splitting at unused campsites or by zero-walk stays. Feasibility is monotone: every schedule valid at `L` remains valid at a larger limit, so binary search finds the first feasible integer.

## Walkthrough

For segments `7,2,6,4,5` and three nights, limit 8 permits `7 | 2+6 | 4 | 5`, four days. Limit 7 needs five days and fails, so optimum is 8. With segments 7 and 11 plus many nights, the maximum cannot fall below 11; extra nights may be rest days at the campsite.

## Why it works

At fixed `L`, greedy's first day reaches the farthest possible campsite. Any valid schedule stopping earlier can extend its first day to that point without increasing later work or the number of days. Repeating on the remaining route proves greedy minimizes day count. Therefore its count being at most `K+1` is necessary and sufficient under the extra-night rule. Monotonic feasibility lets binary search discard exactly impossible lower limits and converge to the minimum feasible maximum.

## Complexity

For total distance `S` and maximum segment `M`, each feasibility scan is `O(N)` and binary search takes `O(log(S-M+1))`, for `O(N log(S-M+1))` time and `O(N)` stored distances.

## Common mistakes

- Reading `N` campsites as only `N` segments.
- Treating `K` nights as `K` rather than `K+1` days.
- Starting a new day when the sum equals the limit.
- Requiring greedy days to equal exactly `K+1`.
- Using average distance despite campsite-only split points.
