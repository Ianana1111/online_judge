# Build an equal-armed Wavio sequence from both directions

## Problem and constraints

A Wavio subsequence has odd length. Its values strictly increase to a center and then strictly decrease, with the same number of elements on both arms. Elements may be skipped, but their original order must remain. The sequence length is at most 10,000, there are fewer than 75 cases, and input ends at EOF. Equal values cannot extend either strict arm; a single element is always a Wavio sequence of length one.

## Building the approach

A standard longest increasing subsequence is not enough because a tall left arm cannot compensate for a short right arm. Instead, try every index as the center.

Let `left[i]` be the longest strictly increasing subsequence ending at `i`. Let `right[i]` be the longest strictly decreasing subsequence starting at `i`. If index `i` is the center, each arm can use only `min(left[i], right[i])` elements including the center. Its best Wavio length is therefore `2 * min(left[i], right[i]) - 1`.

We compute the per-position LIS lengths in `O(N log N)` with a `tails` array. `tails[k]` stores the smallest known final value of an increasing subsequence of length `k+1`. `lower_bound` finds the first tail greater than or equal to the current value, which preserves strictness. Running the same procedure on the reversed sequence and reversing the resulting lengths gives `right`.

## Walkthrough

For `1, 2, 3, 4, 3`, the center value `4` has a left length of four but a right length of two. Only two elements from each side may be used, giving a Wavio of length three, such as `2, 4, 3`; adding the entire left arm would violate equal arm lengths.

For `1, 2, 2, 3, 2, 2, 1`, repeated twos do not extend a strict subsequence, but we can select `1, 2, 3, 2, 1`, whose length is five.

## Why it works

For each processed value, `tails` keeps the smallest possible tail for every attainable length. A smaller tail is never worse for extending with later values. `lower_bound` places the current value after exactly the tails that are strictly smaller, so the recorded position plus one is the correct LIS length ending there.

The reversed calculation gives the corresponding decreasing length from each original index. Any Wavio centered at `i` is bounded by the shorter of these two arms. Conversely, take equal-length prefixes of valid left and right subsequences and share their common center; this constructs a Wavio reaching that bound. Maximizing over all centers is therefore optimal.

## Complexity

Two binary-search passes take `O(N log N)` time. The arrays and `tails` require `O(N)` space.

## Common mistakes

- Using `upper_bound`, which allows equal values to extend a strict subsequence.
- Computing `left[i] + right[i] - 1` without trimming both arms to equal length.
- Forgetting to reverse the second length array back to original indices.
- Returning only the overall LIS length rather than a length for every center.
- Solving for a contiguous subarray instead of a subsequence.
