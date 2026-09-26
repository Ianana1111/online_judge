Identical tiles must not receive distinct labels, or swapping two identical tiles would be counted again. Track only occupied board cells and the remaining count of each shape.

The local board-area limit is 20, allowing a bit mask. At each step, find the first empty cell and try placing each shape, with rotation allowed, using that cell as its top-left corner. An earlier top-left corner would cover either an earlier empty cell or an occupied cell, contradicting the choice. Thus every tiling is considered once, without counting different placement orders.

Encode remaining counts with mixed radices: group g has radix m_g+1 and positional weight `multiplier[g]`. Using one tile subtracts that weight; a zero digit means no tile of that shape remains.

`anchors` precomputes rectangle masks for each top-left cell, and `solve` memoizes occupied masks and remaining codes. A square has only one orientation. A full board counts only when the remaining code is zero. For A cells and G groups, the state bound is 2^A∏(m_g+1), with at most 2G placement checks per state; only reachable states are stored.
