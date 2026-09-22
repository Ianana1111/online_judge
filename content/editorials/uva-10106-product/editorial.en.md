# Simulate decimal long multiplication digit by digit

## Problem and constraints

Read pairs of nonnegative decimal integers smaller than `10^250` and print their exact product. Input continues to EOF. Built-in fixed-width integers cannot hold 250 digits, and the product may have 500 digits. A product involving zero must print one zero.

## Building the approach

Keep both numbers as strings and simulate long multiplication. For digit positions `i` and `j`, add their small product to result position `i+j+1` in an array of `A+B` cells. This first pass collects every partial product by decimal place without attempting to normalize carries.

Then scan the result from right to left. Add `digits[i]/10` to the cell on its left and keep `digits[i]%10` in the current cell. Right-to-left order ensures a newly created carry can be propagated farther left later.

After normalization, skip leading zeros while retaining at least one cell. Internal and trailing zeros remain meaningful and must be printed.

## Walkthrough

For `12*34`, partial products collect by column and normalize to 408. For `100*100`, the result is 10000; zeros are real positions, not removable formatting. For `0*987`, leading-zero removal stops at one remaining zero.

## Why it works

Each input digit represents a coefficient at a power of ten. Multiplying two digits produces a coefficient whose power is the sum of their place powers, exactly the array index `i+j+1`. Summing all such terms therefore represents the full product before carrying.

Replacing ten units in one cell with one unit in the cell to its left preserves numeric value. After the reverse pass every cell is a decimal digit, yielding the standard representation. Removing only leading zeros preserves value and the one-cell rule handles zero.

## Complexity

For lengths A and B, time is `O(AB+A+B)` and result storage is `O(A+B)`.

## Common mistakes

- Parsing the whole input into `long long`.
- Using result index `i+j` without the reserved leading cell.
- Propagating carries left-to-right.
- Removing every digit of a zero product.
- Dropping zeros inside the product.
