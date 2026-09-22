# Unroll the circle and solve every possible first hole by dynamic programming

## Problem and constraints

Cover up to 1,000 holes on a tire of circumference `C` using whole patches of either length `T1` or `T2`, minimizing total length. Patches may cross position zero, and holes exactly at both patch endpoints are covered. Hole positions may be unsorted.

## Building the approach

Sort the holes and append a second copy shifted by `C`. For each original hole as a circular start, cover the next `N` entries of this doubled list as a linear segment. At the first uncovered hole `i`, an optimal next patch may start exactly there; try both lengths and jump to the first hole strictly beyond its inclusive right endpoint.

Precompute both jump destinations with monotone two pointers. For a fixed start and end, compute backward `dp[i]=min(T1+dp[next1[i]], T2+dp[next2[i]])`, clamping jumps to the end. Minimize `dp[start]` across every circular start.

## Walkthrough

On circumference 10 with holes at 0 and 9 and a length-2 patch, choosing 9 as the unfolded start lets one patch cover through position 11, including shifted hole 10. Fixing the cut at zero could wrongly require two patches. Holes at 0 and 2 are also both covered by length two because endpoints are inclusive.

## Why it works

For a linear ordered set, any patch covering the first uncovered hole can be shifted right until it starts there without losing any still-needed earlier hole and without reducing rightward coverage. Thus the two transitions cover an optimal normalized solution. Doubling the positions represents wraparound, and some choice of first original hole matches the circular order of any optimal cover. The backward recurrence therefore solves each possible cut exactly, and their minimum is the circular optimum.

## Complexity

Sorting costs `O(N log N)`, jump preprocessing `O(N)`, and `N` starts with `N` states each cost `O(N^2)`. Storage is `O(N)`.

## Common mistakes

- Fixing the cut at zero and missing a wraparound patch.
- Excluding a hole exactly at a patch's right endpoint.
- Greedily choosing the patch that covers the most holes.
- Charging only the used portion of a whole patch.
- Covering more than the next `N` doubled holes.
