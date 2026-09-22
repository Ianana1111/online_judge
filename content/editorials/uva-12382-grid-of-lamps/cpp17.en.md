`frequency[b]` counts columns with demand `b`; its size is `m+1` because a column has at most `m` cells. `excess` starts as the full column-demand sum, `positive` counts demands above zero, and `answer` includes the `k=0` case.

For each new `k`, the code first subtracts one for every previously positive excess, then removes columns whose demand is exactly `k` from future iterations. Adding the next descending row demand updates `prefix`, and `prefix+excess` is the current cut-derived bound. No grid or residual graph is stored.
