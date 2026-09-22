The helper `accumulate` performs compensated summation: it subtracts the remembered rounding discrepancy from the next value before adding it. Separate compensation variables are used for the natural-log survival sum and the base-ten factorial sum.

Each query stores `(N, original_index)`. After sorting, `step` advances only when needed, adding one new draw and one new factorial term at a time. Duplicate targets therefore require no repeated numerical work.

`-expm1(logSurvival)` evaluates the complement stably. The second answer uses `floor(2 * logFactorial + log10(N + 1))`; the two logarithm bases are intentionally different and must not be interchanged. N = 0 is handled explicitly. Results are stored at their original indices before the final output loop.
