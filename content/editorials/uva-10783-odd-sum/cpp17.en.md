`prefix` computes the number of positive odds through `bound` and returns its square. The only negative argument reached under the constraints is `-1`, for which the integer count expression is exactly zero.

The main loop subtracts `prefix(a-1)` from `prefix(b)`, retaining both closed endpoints. All operations are exact integers; no averaging or rounding is involved.

Case numbers begin at one, and a zero sum is still printed as a normal result line.
