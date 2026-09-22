`counts = [1] * (k + 1)` supplies all one-digit words. The length loop begins at two, so N = 1 naturally skips it and retains the correct base case.

The inner range clips `last - 1` and `last + 1` to valid digits and includes its upper endpoint. Each extension adds the full count for that prior ending into `next_counts[digit]`. Replacing `counts` only after the whole level keeps old and new lengths separate.

`fixed_ratio` receives numerator `100 * sum(counts)` and denominator `(k + 1) ** n`. It scales by 10⁵ and performs integer rounding, then formats exactly five fractional digits. No intermediate integer division discards the small probability before percentage conversion.
