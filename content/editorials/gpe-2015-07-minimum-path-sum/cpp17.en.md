The matrix is read in the same row-major order needed by the dynamic program, so each `value` is consumed immediately. A fresh `dp` vector is allocated per case.

The code handles the start, first row, first column, and interior separately. This avoids artificial infinity sentinels and possible overflow when adding to them. At an interior update, old `dp[c]` is the above cost and new `dp[c-1]` is the left cost. After all rows, `dp.back()` is exactly the destination state.
