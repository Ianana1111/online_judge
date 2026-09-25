Level `K` consists of three copies of level `K-1` in the top-left, top-right, and bottom-left quadrants, plus an all-blue bottom-right quadrant. A complete level has `3^K` red cells.

Define `prefix(K,r)` as red cells in the first `r` rows. With half-height `h=2^(K-1)`, if `r<=h`, the two top copies contribute `2*prefix(K-1,r)`. Otherwise the complete top half contributes `2*3^(K-1)` and the remaining rows contribute `prefix(K-1,r-h)` from the bottom-left copy. The interval answer is `prefix(K,B)-prefix(K,A-1)`.

Each level contains three copies of the previous red pattern. For the first r rows, double the smaller prefix while still in the upper half; after crossing the midpoint, add the full upper half and the lower-left prefix.
