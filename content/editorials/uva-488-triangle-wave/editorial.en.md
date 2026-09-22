# Print one ascending and descending height sequence per wave

## Problem and constraints

For each amplitude `A` and frequency `F`, print `F` triangular waves. Here `1 <= A <= 9`. One wave rises from one `1` through `A` copies of digit `A`, then descends to one `1`. Every pair of waves, including those across test-case boundaries, has exactly one blank line between them, with no extra blank line after the last.

## Building the approach

The row heights for one wave are `1,2,...,A-1,A,A-1,...,2,1`. Print the rising loop from 1 through `A`, then the falling loop from `A-1` through 1 so the peak appears once. At height `h`, construct a string of length `h` filled with digit `h`.

Use one `firstWave` flag for the entire output, rather than resetting it per test case. Before every wave except the first, print one blank separator line. Prefixing separators this way avoids needing to remove a trailing blank line later. When `A = 1`, the falling loop is empty and the wave contains one row.

## Walkthrough

At `A = 3`, row contents are `1`, `22`, `333`, `22`, and `1`. Frequency two prints that shape twice with one empty line between them. At `A = 1, F = 2`, each wave is one `1`, but the two independent waves still require their separator.

## Why it works

The first loop emits every height from 1 to the peak once. The second emits every remaining height in reverse order, completing the symmetric wave without duplicating the peak. Each row contains exactly its height's digit that many times. The outer loop performs this construction exactly `F` times, and the global prefix rule places one blank line before every wave after the first and nowhere else.

## Complexity

One wave prints `2A-1` rows and `A^2` digits. Total output time is `O(FA^2)` and the temporary row string uses `O(A)` space.

## Common mistakes

- Printing the peak twice.
- Omitting the final height-one row.
- Separating only test cases instead of every wave.
- Resetting the global separator flag for each test case.
- Printing a falling row when `A = 1`.
