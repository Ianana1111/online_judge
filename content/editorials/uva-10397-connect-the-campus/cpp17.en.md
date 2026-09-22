`connected` is a symmetric matrix of existing undirected cables, after converting input labels to zero-based indices. Setting `best[0]=0` inserts an arbitrary starting building for free. The complete graph guarantees that every later selection has a finite candidate.

An existing direct cable produces candidate weight zero. Once one building of an old connected component is selected, subsequent zero edges let Prim absorb the rest without adding cost.

`best` stores integer squared distances, keeping comparisons exact. Only the selected value is passed to `sqrtl`, and all chosen lengths accumulate in a `long double` before one final two-decimal formatting step. For a one-building campus, the sole selected cost is zero and the result is `0.00`.
