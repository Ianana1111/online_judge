# Enumerate every longest increasing index path

## Problem and constraints

Given 1 to 9 values in the range `1..2^32-1`, print every strictly increasing subsequence having maximum length. The first output number is the number of such subsequences, not their length. This platform distinguishes subsequences by their selected original indices: two different index paths are counted separately even when they print the same values. The order of the output lines does not affect judging.

## Building the approach

Computing one LIS or only its length is insufficient because every maximum path must be emitted. Since `n` is at most nine, we can first learn which choices are capable of completing an optimal path and then enumerate them all.

Let `up[i]` be the maximum length of a strictly increasing subsequence starting at index `i`. Compute it from right to left. It is initially one, and any later index `j` with `value[j] > value[i]` may extend it to `1 + up[j]`. The global maximum `L` is the largest `up[i]`.

During depth-first search, keep the next allowed index, the chosen values, and the number of elements still needed. An index is eligible when it is later than all chosen indices, its value is larger than the previous value, and `up[i]` equals the remaining length. The last condition discards branches that cannot finish an LIS.

## Walkthrough

For `2,5,3,1,6,4`, the maximum length is three. The search produces `2,5,6`, `2,3,6`, and `2,3,4`, so the first output is `3`.

If seven values are strictly decreasing, the maximum length is one and every individual index is a different answer. For `1,2,1,2`, three index pairs produce the printed values `1 2`; all three must remain because the platform counts index paths.

## Why it works

By reverse induction, `up[i]` is correct: every increasing subsequence from `i` either stops there or next selects a later, larger value `j`, and every such `j` is examined. In the enumeration, index order and the last-value check guarantee that every generated path is a valid strict subsequence.

For an optimal path with `remaining` positions left, its next index must have `up[i]=remaining`. A smaller value could not complete the path, while a larger value together with the current prefix would contradict the global optimum. Therefore every LIS follows an explored branch. Each sequence of selected indices defines exactly one DFS branch, so no index path is duplicated or omitted.

## Complexity

The dynamic program takes `O(n^2)`. Enumeration and output have the conservative bound `O(n 2^n)` time and stored output space, with `O(n)` recursion depth. The tiny `n <= 9` limit makes complete enumeration practical.

## Common mistakes

- Printing the LIS length where the answer count is required.
- Allowing equal values in a strictly increasing path.
- Keeping only one predecessor and therefore printing only one LIS.
- Deduplicating identical value lines that came from different indices.
- Sorting the input and destroying subsequence order.
