# Simulate every matrix command in its original order

## Problem and constraints

An `N x N` digit matrix receives up to 49 commands: swap two rows, swap two columns, increment every digit modulo 10, decrement every digit modulo 10, or transpose the matrix. `N<10`, so direct simulation is sufficient. Row and column indices are one-based, and output rows contain adjacent digits without spaces.

## Building the approach

Maintain the invariant that the stored matrix is the result after all commands read so far. Execute each command immediately because row swaps, column swaps, and transpose generally cannot be reordered.

For `row`, swap two complete row vectors. For `col`, swap the requested entries in every row. Map `inc` to `(x+1)%10`. For `dec`, use `(x+9)%10`; writing `(x-1)%10` in C++ would turn zero into `-1`. For transpose, swap `a[r][c]` with `a[c][r]` only when `r<c`, so each off-diagonal pair is exchanged exactly once.

## Walkthrough

Starting with rows `09` and `12`, `inc` produces `10` and `23`; transposing then gives rows `12` and `03`. Changing the order of a transpose and a row swap can produce a different answer, so input order must be preserved. Decrementing a one-cell matrix containing 0 must produce 9.

## Why it works

Initially the stored matrix equals the input. Each row or column command performs exactly the named coordinate permutation. Adding 1 or 9 modulo 10 implements cyclic increment or decrement. The transpose loop exchanges every off-diagonal symmetric pair once and leaves diagonal cells fixed. Therefore each operation transforms the correct current matrix into the precisely defined next matrix. Induction over commands proves the final output is correct.

## Complexity

Each command takes at most `O(N^2)` time, for `O(MN^2)` total. The matrix uses `O(N^2)` space.

## Common mistakes

- Using a negative C++ remainder for decrement.
- Traversing the full matrix during transpose and swapping each pair twice.
- Forgetting to convert row and column indices from one-based to zero-based.
- Reordering commands by type.
- Adding spaces between output digits or omitting the required blank line.
