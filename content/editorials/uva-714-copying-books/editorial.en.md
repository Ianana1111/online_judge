# Binary-search the workload limit, then reconstruct from the right

## Problem and constraints

Partition up to 500 books, in original order, among `K` scribes. Every scribe receives a nonempty contiguous group. Minimize the maximum group sum; among equal optimums, minimize the first scribe's sum, then the second's, and so on. Print exactly `K` groups using slashes with one space around each separator. Page counts are positive and totals may exceed 32-bit range.

## Building the approach

Binary-search the optimal maximum load `L` between the largest book and total pages. For a fixed `L`, scan left to right, keeping each group as long as possible and opening a new one only when the next book would exceed `L`. This greedy scan uses the minimum number of groups. The limit is feasible when that count is at most `K`, because positive-page groups may be split further to reach exactly `K` nonempty groups. Feasibility is monotone in `L`.

After finding the minimum `L`, reconstruct from right to left. Put as many books as possible into the last group, then the preceding group. Insert a boundary when adding the current book would exceed `L`, or when the books left are just enough to give every remaining group one. Filling later groups this way pushes work rightward and lexicographically minimizes earlier group sums.

## Walkthrough

Five 100-page books for four scribes have optimal maximum 200. The tie rule requires `100 / 100 / 100 / 100 100`: the final scribe takes two books so each earlier load is as small as possible. A left-filling reconstruction would place 200 first and violate that secondary objective.

## Why it works

For a fixed limit, the greedy first group extends at least as far as any valid first group; replacing another partition's prefix with it cannot increase the number of groups needed later. Repeating proves greedy uses the minimum groups, so `groups <= K` exactly characterizes feasibility and binary search finds the minimum possible maximum.

For reconstruction, move each boundary left while the right group stays within `L` and enough books remain for nonempty earlier groups. This decreases the affected earlier sum without changing any earlier fixed sum or violating the optimum limit. Fixing groups from right to left therefore gives the lexicographically smallest vector of group sums among all minimax partitions.

## Complexity

With total pages `S`, binary search takes `O(N log S)` time, reconstruction `O(N)`, and storage `O(N)`. All sums and limits require `long long`.

## Common mistakes

- Printing only the optimum load without group boundaries.
- Reconstructing greedily from the left and violating tie rules.
- Failing to reserve one book per remaining scribe.
- Allowing an empty group.
- Accumulating total pages in 32-bit `int`.
