Keep both numbers as strings and simulate long multiplication. For digit positions `i` and `j`, add their small product to result position `i+j+1` in an array of `A+B` cells. This first pass collects every partial product by decimal place without attempting to normalize carries.

Then scan the result from right to left. Add `digits[i]/10` to the cell on its left and keep `digits[i]%10` in the current cell. Right-to-left order ensures a newly created carry can be propagated farther left later.

After normalization, skip leading zeros while retaining at least one cell. Internal and trailing zeros remain meaningful and must be printed.

Mirror schoolbook multiplication: accumulate every digit pair into its decimal column, then carry right to left. When removing leading zeroes, keep one zero for a zero product.
