# Keep the best peak or valley while alternating from a descent

## Problem and constraints

Given a permutation of `1..N`, find the longest subsequence whose first comparison is down, the next is up, and the directions continue alternating. `N` can reach 30,000. Values are distinct. The required initial descent matters, so a generic wiggle algorithm that may begin upward is not directly equivalent.

## Building the approach

After choosing a valid prefix, only its last value and the direction needed next affect future choices. Begin with one selected element and `needDown = true`.

When the new value satisfies the needed comparison, append it, increase the length, and flip the direction. When it does not, the length cannot increase, but the new value should still replace the endpoint. While waiting to go down, a larger endpoint is at least as useful; while waiting to go up, a smaller endpoint is at least as useful. In both cases, assigning the current value as `last` retains the favorable extreme of the current monotone run.

## Walkthrough

For `1,2,3,4`, no descent ever appears, so the answer stays 1. An unrestricted wiggle solution might incorrectly return 2. For `4,1,3,2`, every comparison supplies the requested down, up, down pattern, giving 4. In `2,4,1,3`, the 4 first replaces 2 as a better peak; then 1 and 3 extend the sequence, giving length 3.

## Why it works

While a descent is needed, keeping the largest endpoint cannot remove any future smaller value that could complete the descent. Symmetrically, while an ascent is needed, keeping the smallest endpoint cannot remove any future larger value. Thus replacements preserve the best possible endpoint for the current length and next direction.

The first encountered change in the required direction may be selected immediately: any later value in the same monotone run can still replace it with a more favorable extreme. A valid alternating subsequence cannot obtain more than one new turn from one monotone run, while the greedy takes one at every available turn. Therefore its length is maximum under the required initial descent.

## Complexity

Every value is examined once, for `O(N)` time. The greedy state uses `O(1)` extra space; this implementation additionally stores the `O(N)` input array.

## Common mistakes

- Allowing the first selected comparison to be upward.
- Ignoring a nonextending value instead of replacing the endpoint.
- Searching for a contiguous subarray rather than a subsequence.
- Flipping direction even when the current value was not selected as a new turn.
