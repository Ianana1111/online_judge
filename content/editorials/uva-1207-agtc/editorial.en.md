# Compute unit edit distance with two rolling rows

## Problem and constraints

Transform string `x` into `y` using unit-cost insertion, deletion, or substitution; matching aligned characters costs zero. Input is length-prefixed and continues until EOF, including possible empty strings. Although `|x|<=|y|`, an optimal edit sequence may still delete characters.

## Building the approach

Let `D[i][j]` be minimum cost to transform the first `i` source characters into the first `j` target characters. The final operation is one of:

- delete `x[i-1]`: `D[i-1][j]+1`;
- insert `y[j-1]`: `D[i][j-1]+1`;
- align the last characters: `D[i-1][j-1]` plus one when different.

Take the minimum. Empty source to `j` characters costs `j`, and `i` characters to empty costs `i`. Each row depends only on the previous row and its completed left neighbor, so retain two rows.

## Walkthrough

`A` to `T` costs one substitution, whereas an insertion/deletion-only formula would return two. Equal `AGTC` strings cost zero. Empty to `A` costs one; both empty cost zero. Source being shorter does not eliminate potentially beneficial deletions.

## Why it works

Every edit sequence has one of the three listed final actions. Removing it leaves exactly its corresponding prefix subproblem, which must be optimal or could be replaced to improve the whole sequence. Conversely, each transition appends a legal final action to an optimal prefix solution. Thus the recurrence is exact, and induction from the empty-prefix bases gives the desired `D[m][n]`. Rolling storage discards only rows no longer referenced.

## Complexity

Time is `O(mn)` and space `O(n)`.

## Common mistakes

- Using an LCS formula that charges replacement as two.
- Charging for equal aligned characters.
- Misinitializing empty-prefix rows or columns.
- Assuming a longer target means deletions are never useful.
- Overwriting the previous row before the current row is complete.
