`power3` stores complete-level counts. `half` uses a 64-bit shift, and `prefix` tests `rows==0` before `k==0`, distinguishing an empty prefix from the original one-cell grid.

An upper-half prefix keeps its relative row count and doubles the recursive result. A lower-half prefix adds both complete top copies, subtracts `half` rows, and recurses only into the bottom-left copy. The final exact difference is stored in `long long` and is not reduced modulo anything.
