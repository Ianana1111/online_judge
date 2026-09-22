# Sort by absolute size and count alternating color runs

## Problem and constraints

Each available floor has a unique size and one of two colors: negative input denotes red and positive denotes blue, with absolute value as size. A lower floor must be larger, and adjacent selected floors must have opposite colors. Input order does not restrict construction. Find the maximum floors, with up to 500000 candidates.

## Building the approach

Sort by absolute size from small to large, viewing the building from top toward bottom. Size order is now automatically valid. The remaining task is the longest alternating-color subsequence.

Group consecutive sorted entries of the same color. At most one floor can be chosen from a color run: two selections from the same run have no opposite-colored, intermediate-size floor available between them. Conversely, choosing one floor from every run creates a valid alternating sequence because adjacent runs have different colors and increasing sizes.

Therefore scan the sorted list and increment the answer whenever color changes. Compare signs only; distinct same-color sizes remain in one run.

## Walkthrough

If sorted colors are red, red, blue, blue, red, blue, there are four runs and four usable floors. The two reds of the first run cannot both be selected because no fitting blue lies between their sizes.

If every floor has one color, the answer is one regardless of how many sizes exist.

## Why it works

Every legal building, read from top to bottom, is a subsequence of the absolute-size-sorted list with alternating colors. Selecting two elements from one contiguous same-color run would require an opposite color between their positions, which does not exist, so the run count is an upper bound.

Selecting any one element from each run gives strictly increasing sizes and alternating colors, attaining that bound. Hence the run count is optimal.

## Complexity

Sorting takes `O(N log N)`, scanning takes `O(N)`, and storage is `O(N)`.

## Common mistakes

- Sorting signed values instead of absolute sizes.
- Using original input order.
- Inferring the answer only from total counts of the two colors.
- Counting every differently sized floor in one color run.
- Testing with duplicate absolute sizes, which the problem excludes.
