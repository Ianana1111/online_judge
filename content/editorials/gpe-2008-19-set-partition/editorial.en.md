# Meet in the middle to enumerate equal-sum subsets

## Problem and constraints

Given up to 30 distinct positive integers, print every subset whose sum equals the sum of its complement. Values may be as large as `10^12`. A subset and its complement count as separate answers. Output order is first by subset size, then lexicographically by the sorted values. This platform limits each input file to 50 datasets and the combined number of output subsets to 10,000, while retaining the original `N <= 30` bound.

## Building the approach

Moving both sides of the equality shows that an answer must sum to exactly half of the total. An odd total has no answer. For an even total, enumerating all `2^30` subsets is too expensive, but enumerating `2^15` subsets is small enough. Split the sorted values into two halves and enumerate every `(sum, mask)` pair in each half.

Sort the right-half pairs by sum. For every left pair with sum `s`, binary-search the complete range whose sum is `total/2-s`. Every pair in that range creates one answer mask. Equal right sums must all be retained because they may represent different subsets.

To order answers, compare their popcounts first. When sizes match, locate the lowest index where their masks differ. Since the values were sorted, the subset containing that smaller value is lexicographically earlier. Finally, walk mask bits from low to high to print each subset in increasing value order.

## Walkthrough

For `{1,2,3}`, the total is six and the target is three. Both `{3}` and `{1,2}` qualify; they are complements, but both must be printed. The one-element subset comes first. For `{1,2,4}`, the total is odd, so `No such subset` follows immediately.

The total must use 64-bit arithmetic: thirty values near `10^12` exceed a 32-bit integer even though each individual value is valid.

## Why it works

Every full subset decomposes uniquely into a left-half subset and a right-half subset. Its sum equals the target exactly when those two stored sums are complementary. The algorithm enumerates every left mask once and pairs it with all and only right masks having the required sum, so it neither misses nor duplicates an answer.

Each answer mask uniquely determines its subset. Popcount implements the primary output key. With equal sizes, the first differing sorted value determines lexicographic order; the side containing that value has the smaller next element, exactly matching the lowest differing bit comparison. Printing bits in sorted index order also gives the required order within each subset.

## Complexity

Let `L=2^floor(N/2)`, `R=2^ceil(N/2)`, and `K` be the number of answers. Building, sorting, and matching take `O((L+R) log R + K)` time. Sorting answers takes `O(K log K)`, printing takes `O(NK)`, and space is `O(L+R+K)`.

## Common mistakes

- Merging a subset with its complement and printing only one.
- Searching for `total/2` when the total is odd.
- Keeping only one mask for a repeated half-sum.
- Sorting by input order or numeric mask rather than sorted values.
- Using 32-bit integers for sums.
