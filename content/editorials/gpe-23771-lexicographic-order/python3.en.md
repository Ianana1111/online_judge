Convert the one-based rank to zero-based. Permutations of `n` symbols are partitioned by their first symbol into `n` blocks of `(n-1)!` permutations. Therefore `rank/(n-1)!` tells us the relative alphabet position of the known first symbol, not which symbol to choose for a generated permutation.

Maintain `available`, the still-empty positions of the unknown alphabet in increasing order. Put `word[i]` into position `available[index]`, erase that position, and replace rank by its remainder within the selected block. Repeat with the next smaller factorial.

Twenty factorial fits unsigned 64-bit storage. Vector erasure is quadratic in `n`, but `n` is only twenty.

Factoradic digits of the given rank reveal where each current symbol sits among unused alphabet positions. Divide by the factorial block size, place the symbol at that unused position, and continue with the remainder.
