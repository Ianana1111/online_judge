# Apply inclusion-exclusion to the four empty-border events

## Problem and constraints

Choose `K` distinct cells of an `M x N` grid so that top, bottom, left, and right borders each contain at least one chosen cell. Corner cells cover two borders. Chosen people are unlabeled, `2<=M,N<=20`, `K<=500`, and answers are modulo 1,000,007.

## Building the approach

Begin with all `C(MN,K)` cell sets. Define four bad events saying one border is empty and use inclusion-exclusion. A four-bit mask selects borders forced empty. If it removes `r` horizontal border rows and `c` vertical border columns, remaining cells number `(M-r)(N-c)`, and the intersection contributes `C(cells,K)`. Add even-popcount masks and subtract odd-popcount masks.

Precompute combinations through 400 with Pascal's recurrence modulo 1,000,007. This avoids assuming the modulus supports a factorial-inverse formula. Removing full rows and columns automatically handles corners without double subtraction.

## Walkthrough

On a 2-by-2 board, one person covers at most two borders, so the answer is zero. On a 2-by-3 board with two people, only the two opposite-corner pairs cover all four borders. Selecting every cell always gives one valid set, while `K=0` gives zero.

## Why it works

Consider one fixed chosen-cell set missing exactly `t` borders. Inclusion-exclusion counts it over all subsets of those missing borders with coefficient `sum (-1)^|S|=(1-1)^t`. The coefficient is zero when any border is missing and one when none is missing. Thus every invalid set cancels and every valid set remains once. Each mask's rectangular remaining-cell count exactly matches its event intersection.

## Complexity

Pascal preprocessing takes `O(400^2)` time and space. Each case evaluates 16 masks in `O(1)` additional time.

## Common mistakes

- Counting permutations of labeled people instead of cell subsets.
- Subtracting only the four individual bad events without adding intersections.
- Using modulus 1,000,000,007 instead of 1,000,007.
- Subtracting four border lengths and double-removing corners.
- Indexing combinations when `K` exceeds available cells.
