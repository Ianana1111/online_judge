# Extend the covered prefix as far as one interval allows

## Problem and constraints

Choose the fewest supplied closed intervals covering all of [0, M], where 1 ≤ M ≤ 5,000. There are at most 100,000 intervals, with endpoint magnitudes at most 50,000. The pair `0 0` ends a case and is not an interval. Print the count and original selected intervals in left-endpoint order, or zero if impossible. Any valid minimum-size cover is accepted.

## Building the approach

Keep `covered` as the right end of a continuously covered prefix beginning at zero. To avoid a gap, the next useful interval must begin at or before `covered`. Among all such intervals, choose the one ending farthest right.

This is the opposite of the earliest-finish rule used in activity selection: here overlap is allowed, and the goal is maximum progress per selected interval. Sort by left endpoint so all currently eligible intervals can be scanned together. The scan pointer never moves backward. Every rejected eligible interval ends no farther than the selected one, so it cannot help after this extension.

If no eligible interval strictly extends the prefix, coverage is impossible. Otherwise save the original interval, advance `covered`, and continue until it reaches M. Negative left endpoints and right endpoints beyond M are allowed; do not invent clipped or merged intervals for output.

## Walkthrough

For M = 5 and intervals `[−1,3], [0,3], [2,5], [3,5]`, either of the first two reaches three, and either of the last two reaches five. Two intervals are sufficient and necessary. With only `[0,1]` and `[2,5]`, the gap between one and two cannot be filled, so print zero.

## Why it works

Any complete cover must extend the current prefix using an interval beginning no later than its endpoint. Replacing that choice with the eligible interval ending farthest right uses no more intervals and leaves no harder remainder to cover. Repeating this exchange gives an optimal cover following every greedy choice. If no extension exists, no cover can cross that gap. Previously scanned unchosen intervals cannot extend the new endpoint, justifying the one-way scan.

## Complexity

Sorting takes O(N log N), and the subsequent scan is O(N). Input and selected intervals use O(N) space.

## Common mistakes

- Choosing the earliest finishing interval.
- Rejecting an interval that starts exactly at the covered endpoint.
- Selecting a nonextending interval and looping forever.
- Printing merged endpoints absent from the input.
- Returning a partial cover after discovering a gap.
