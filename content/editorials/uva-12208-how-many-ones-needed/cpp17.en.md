`prefix` handles negative input first, which makes the `a=0` query require no separate branch. For each `bit`, `period=2*bit` describes its full zero-one cycle and `count=n+1` is used for both the number of complete cycles and the remainder.

`max(0LL, count%period-bit)` contributes nothing while the remainder is still inside the zero block and keeps the expression in 64-bit arithmetic. `bit`, `period`, and `total` all fit for the stated maximum. The main loop increments the case number only for real queries and subtracts `prefix(left-1)` to retain both interval endpoints.
