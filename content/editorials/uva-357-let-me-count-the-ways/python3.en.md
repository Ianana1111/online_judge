Choosing a next coin recursively can accidentally count different orders of the same collection. Instead, introduce denominations in a fixed order. Let `ways[s]` be the number of combinations making `s` with the denominations processed so far. Start with `ways[0] = 1` and all other entries zero.

For a new denomination `coin`, scan `s` upward from `coin` and perform

`ways[s] += ways[s - coin]`.

The old value counts combinations that do not use the new denomination. Each combination counted at `s - coin` becomes one using at least one new coin after another copy is attached. The upward scan allows `ways[s - coin]` to already contain this denomination, which provides unlimited copies. Keeping the coin loop outside ensures that a collection is introduced only once, independent of order.

`ways[0] = 1` seeds the dynamic program; precompute through 30000 before answering queries.
