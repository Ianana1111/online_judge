# Shrink a sliding window that covers every value from one to K

## Problem and constraints

Generate a length-`N` sequence whose first three values are fixed as 1, 2, 3 and whose later values are the previous three sum modulo `M`, plus one. Find the shortest contiguous interval containing every integer 1 through `K`; print `sequence nai` if none exists. `N` reaches one million. The fixed prefix is not reduced modulo `M`.

## Building the approach

Generate the sequence, then maintain a window `[left,right]`. `frequency[v]` counts occurrences of required value `v`, and `covered` counts how many of the `K` required values currently have positive frequency. Values above `K` do not affect coverage.

Expand `right` one position at a time. When adding the first copy of a required value, increment `covered`. Whenever `covered==K`, record the current inclusive length and move `left` rightward as far as possible. Decrement `covered` only when the removed value's frequency reaches zero.

Do not reject `K>M` automatically: values 2 and 3 can still occur in the fixed prefix even when later recurrence values cannot reach them.

## Walkthrough

With `N=3,M=1,K=2`, the sequence is still `1,2,3`, and the shortest answer is 2. For `K=3`, the answer is 3. For `K=4`, the initial prefix and all later values, which are 1 here, never contain 4, so no interval exists.

## Why it works

Frequencies exactly describe the current window, and zero-to-one or one-to-zero changes make `covered==K` equivalent to complete coverage. For a fixed right endpoint, advancing left can only remove elements, so the inner loop examines every successively shorter valid window until the first invalid one. A discarded earlier left endpoint cannot become part of a better future answer, because any later right endpoint only makes that interval longer than when it was already considered. Thus both pointers move monotonically without missing the optimum.

## Complexity

Generation and the sliding window each take `O(N)` time. The stored sequence uses `O(N)` space and frequencies use `O(K)`.

## Common mistakes

- Treating the requirement as a noncontiguous subsequence.
- Applying the modulo recurrence to the first three fixed values.
- Declaring every `K>M` case impossible.
- Decreasing `covered` before a removed value's frequency reaches zero.
- Computing length as `right-left` instead of `right-left+1`.
