# Select the K-th password by mixed-radix blocks

## Problem and constraints

Two 6-by-5 uppercase grids describe five-character passwords. At each position, a letter is allowed only if it appears in that column of both grids. Duplicate occurrences do not create duplicate passwords. Print the `K`-th distinct password in lexicographic order, or `NO` if fewer exist; `K` is at most 7,777.

## Building the approach

For each column, form the set intersection of letters from both grids and list it from A through Z. Valid passwords are exactly the Cartesian product of these five sorted lists, with at most `6^5=7776` elements.

Let `suffix[col]` be the number of combinations from that column onward. Convert `K` to zero-based `rank`. At column `col`, every candidate letter owns a consecutive block of `suffix[col+1]` passwords. Choose index `rank/block`, then replace `rank` by `rank%block`. Reject before division when the total is too small.

## Walkthrough

If the first choices are A,B and the second are C,D while later positions are fixed E,F,G, the order is `ACEFG,ADEFG,BCEFG,BDEFG`. Zero-based rank two selects first-letter block B and then second letter C. Six repeated A rows still create only `AAAAA`, not thousands of copies.

## Why it works

Each column intersection is exactly the set accepted by both grids, and independent position choices make their product exactly the valid passwords. Lexicographic order groups equal prefixes into consecutive, equal-sized suffix blocks. Division selects the unique block containing the target rank, and the remainder is its within-block rank. Repeating this argument fixes the unique `K`-th word.

## Complexity

Each case examines a fixed 60 grid cells and five 26-letter sets, then performs constant work; auxiliary space is `O(5*26)`.

## Common mistakes

- Taking a union instead of an intersection.
- Counting duplicate letters within a column multiple times.
- Treating `K` as zero-based.
- Rejecting `K` equal to the total count.
- Dividing before handling an empty intersection.
