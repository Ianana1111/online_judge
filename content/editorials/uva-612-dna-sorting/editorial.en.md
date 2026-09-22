# Score every DNA string by inversions and sort stably

## Problem and constraints

Each dataset contains `M` DNA strings of equal length `N`, where `1 <= N <= 50`, `1 <= M <= 100`, and characters are `A,C,G,T`. A string's unsortedness is the number of pairs `i < j` with `s[i] > s[j]`. Output strings by increasing score, preserving original input order among ties, with a blank line between datasets.

## Building the approach

For each string, examine every pair of positions with a double loop and increment only on strict greater-than. Equal letters do not form an inversion. With length fifty, at most 1225 comparisons per string make this direct definition-based method sufficient.

Store the score beside the untouched original string. Apply a stable sort whose comparison uses only the score. Sorting a normal `(score,string)` pair would introduce lexicographic text order for ties and violate the required stability. The characters inside each DNA string are never rearranged.

## Walkthrough

`CA` has one inversion, while `AC` and `AA` have zero. Input `CA, AA, AC` outputs `AA, AC, CA`; the zero-score strings retain their original order. All one-character strings score zero, so input `T,G,C,A` must remain exactly that order.

## Why it works

The nested loops enumerate every and only pair with `i < j` once, and count precisely those satisfying the inversion definition. Sorting by that score places smaller unsortedness first. Stability preserves relative order for every equal-score group, and pairing scores with original strings keeps the printed content unchanged. These properties match both ordering rules exactly.

## Complexity

Scoring takes `O(MN^2)` time and stable sorting `O(M log M)`, for total `O(MN^2 + M log M)`. Stored strings use `O(MN)` space.

## Common mistakes

- Counting equal letters by using `>=`.
- Counting only adjacent inversions.
- Breaking score ties lexicographically.
- Using an unstable sort without original indices.
- Sorting characters inside each DNA string.
