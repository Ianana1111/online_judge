# Recover each missing middle from a three-row triangle

## Problem and constraints

A nine-row triangular wall has row i containing i bricks. Every nonbottom brick equals the sum of the two directly below it. Values are supplied only at odd-numbered rows and positions; reconstruct all 45 integers. A valid integer solution is guaranteed, values need not be positive, and output uses one space between adjacent bricks.

## Building the approach

Examine a local triangle spanning two row gaps. Let its bottom three values be `left,middle,right`. The row above contains `left+middle` and `middle+right`, so the top is

`top=left+2*middle+right`.

Therefore

`middle=(top-left-right)/2`.

Once middle is known, fill the two bricks immediately above it. In zero-based storage, known rows and columns are even. Work upward from row six to zero, using the known endpoints two rows below each top. Exact integer input guarantees divisibility by two.

## Walkthrough

If top is 15 and the lower outer bricks are 3 and 4, the middle is `(15-3-4)/2=4`. The intervening row is then 7 and 8, which sums back to 15.

Omitting division by two would produce eight and violate the wall equation.

## Why it works

The wall rule necessarily gives `top=left+2middle+right`, so the formula is the only possible middle value. The two reconstructed upper bricks then sum exactly to top, making the local triangle valid.

Processing every supplied alternating position fills each missing slot through one such triangle. The guaranteed consistent input makes overlapping deductions agree, yielding the unique complete wall.

## Complexity

The wall has a fixed 45 cells, so each case uses constant structural work and storage, with arithmetic cost depending on integer digit length.

## Common mistakes

- Forgetting the division by two.
- Confusing one-based odd positions with zero-based even indices.
- Assuming all values are positive.
- Printing only the five supplied rows.
- Using floating point for potentially large exact integers.
