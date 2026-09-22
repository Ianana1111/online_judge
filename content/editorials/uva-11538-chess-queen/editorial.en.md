# Sum ordered queen pairs along rows, columns, and diagonals

## Problem and constraints

Place one black and one white queen on different cells of an `M x N` board and count placements where they attack each other. The queens are distinguishable, so exchanging their cells creates another placement. Rows, columns, and both diagonal directions attack. Dimensions reach one million and the answer fits signed 64 bits.

## Building the approach

Swap dimensions so `m<=n`. Ordered pairs sharing a row or column total

`mn(n-1) + mn(m-1) = mn(m+n-2)`.

For one diagonal direction, lengths 1 through `m-1` each occur twice, and length `m` occurs `n-m+1` times. A diagonal of length `L` contributes `L(L-1)` ordered pairs. Both directions therefore contribute

`4 * sum_{L=1}^{m-1} L(L-1) + 2(n-m+1)m(m-1)`.

Using `sum L(L-1)=m(m-1)(m-2)/3` gives constant-time arithmetic. These attack classes are disjoint for two distinct cells, so their counts add directly.

## Walkthrough

On a 2-by-2 board, rows contribute 4 ordered placements, columns contribute 4, and the two length-2 diagonals contribute 4, totaling 12. On a 1-by-`n` board, no diagonal has length above one and the answer is `n(n-1)`. A 1-by-1 board gives zero.

## Why it works

Every placement is uniquely an ordered pair of black and white cells. Two distinct cells that attack share exactly one row, column, or diagonal direction, so no counted class overlaps. Choosing two ordered cells on each line yields `L(L-1)`, and the stated rectangular diagonal distribution lists every diagonal exactly once. Summing all line contributions therefore counts every attacking placement exactly once.

## Complexity

Each board takes `O(1)` time and `O(1)` space. All arithmetic begins with 64-bit operands.

## Common mistakes

- Treating black and white as interchangeable and dividing by two.
- Counting only one diagonal direction.
- Missing repeated maximum-length diagonals on a rectangle.
- Applying the short-side formula before normalizing dimensions.
- Multiplying in `int` before assigning to `long long`.
