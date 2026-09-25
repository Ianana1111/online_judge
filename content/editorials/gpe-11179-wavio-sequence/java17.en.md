A standard longest increasing subsequence is not enough because a tall left arm cannot compensate for a short right arm. Instead, try every index as the center.

Let `left[i]` be the longest strictly increasing subsequence ending at `i`. Let `right[i]` be the longest strictly decreasing subsequence starting at `i`. If index `i` is the center, each arm can use only `min(left[i], right[i])` elements including the center. Its best Wavio length is therefore `2 * min(left[i], right[i]) - 1`.

We compute the per-position LIS lengths in `O(N log N)` with a `tails` array. `tails[k]` stores the smallest known final value of an increasing subsequence of length `k+1`. `lower_bound` finds the first tail greater than or equal to the current value, which preserves strictness. Running the same procedure on the reversed sequence and reversing the resulting lengths gives `right`.

Compute strict LIS lengths ending at each position from both directions. A center can use only the shorter arm on each side, giving length 2*min(left,right)-1.
