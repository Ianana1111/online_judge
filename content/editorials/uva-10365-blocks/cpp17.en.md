The outer loop first verifies that `a` divides `n`. Only then is `n/a` treated as the product of the remaining sides. The inner loop starts at `a` and stops at the inclusive square boundary, avoiding dimension permutations while retaining equal sides.

The second divisibility check occurs before `c` is calculated, so chained integer division never silently represents a smaller volume. Surface area adds the three distinct face products and doubles them for their opposite faces.

With `n<=1000`, all products fit comfortably in `int`. The answer is reset to `6*n` for each test case, and the always-valid `1*1*n` box guarantees that this upper bound can be matched or improved.
