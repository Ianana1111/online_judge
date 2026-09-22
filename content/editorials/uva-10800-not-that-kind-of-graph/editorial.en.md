# Draw each unit segment at the lower of its endpoint heights

## Problem and constraints

A price path uses `R` for rising, `F` for falling, and `C` for constant movement. Render these unit segments as `/`, backslash, and `_`, with the required vertical and horizontal axes. Strings have length one through fifty. Do not print unused rows or trailing spaces; leave a blank line after each case.

## Building the approach

Track the current endpoint height. A rising slash occupies its starting, lower row, so draw first and then increment height. A falling backslash occupies its ending, lower row, so decrement first and then draw. A constant segment stays at the current height.

Each input position owns one horizontal column. Store the chosen character in a row string keyed by height. After drawing, print from the highest occupied row through the lowest. Trim only trailing spaces, preserving leading gaps after the vertical axis.

The horizontal axis contains `n+2` dashes: one gap column, `n` plot columns, and one extension. Heights may be negative; only their relative order matters.

## Walkthrough

`RF` draws `/\` on one row, while `FR` draws `\/` on one row. Both return to their starting height, but the order produces different shapes.

For an all-falling sequence, occupied rows descend below zero. The horizontal axis still appears directly below the lowest drawn row; no empty rows are added merely to return to height zero.

## Why it works

A rising or falling unit segment occupies the lower of its two endpoint rows, while a constant segment occupies their shared row. Drawing before increment for R, before writing after decrement for F, and without change for C implements exactly this geometry.

Time positions increase by one column, so segments never overwrite each other. The highest-to-lowest occupied-height range contains every stroke and no unused exterior row. Trimming trailing blanks changes no stroke position, while fixed axis prefixes and width satisfy the format.

## Complexity

At most `n` rows of width `n` are stored and printed, so time and space are `O(n^2)`.

## Common mistakes

- Drawing F before lowering its height.
- Raising before drawing R.
- Forcing zero height to be the bottom and adding or omitting rows.
- Printing too few horizontal-axis dashes.
- Leaving trailing spaces at the ends of plot rows.
