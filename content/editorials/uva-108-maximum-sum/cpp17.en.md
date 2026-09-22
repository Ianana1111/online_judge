Every new `top` creates a zeroed column vector. Increasing `bottom` adds one complete row, so the vector always represents exactly the current row band.

`ending` starts from the first column rather than zero, enforcing a nonempty subarray. Remaining columns compare restarting with extending the prior ending.

The global answer begins at `INT_MIN`, allowing all-negative matrices to update it. The input condition handles both zero sentinel and EOF and never indexes an empty matrix.
