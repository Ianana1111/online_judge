`seen` has N entries; only indices 1 through N − 1 are meaningful. `previous` is read before the loop, and each iteration reads `current`, computes `llabs(current - previous)`, and then advances `previous`.

The rejection condition checks the range before evaluating `seen[difference]`. C++ short-circuit evaluation therefore prevents an invalid array access. A valid new difference is marked immediately so that a later repetition is detected.

`good` remembers any earlier failure and is never reset inside the sequence. The loop still reads all N numbers, which keeps the outer EOF loop aligned with the next case. The zero-iteration loop for N = 1 leaves `good` true. The final strings deliberately use the judge's exact capitalization: `Jolly` and `Not jolly`.
