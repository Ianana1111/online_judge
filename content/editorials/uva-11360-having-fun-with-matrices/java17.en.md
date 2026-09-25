Maintain the invariant that the stored matrix is the result after all commands read so far. Execute each command immediately because row swaps, column swaps, and transpose generally cannot be reordered.

For `row`, swap two complete row vectors. For `col`, swap the requested entries in every row. Map `inc` to `(x+1)%10`. For `dec`, use `(x+9)%10`; writing `(x-1)%10` in C++ would turn zero into `-1`. For transpose, swap `a[r][c]` with `a[c][r]` only when `r<c`, so each off-diagonal pair is exchanged exactly once.

The matrix is tiny, so execute commands in order. Transpose swaps only one side of the diagonal; decrement uses plus nine modulo ten to avoid negative remainders.
