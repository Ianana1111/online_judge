# Make the first divisible sum, then count zero-residue moves

## Problem and constraints

Players S and T alternate deleting one digit, with S first. A move is legal only when the remaining digit sum is divisible by 3 or no digits remain. A player with no legal move loses. The number has up to 1,000 nonzero digits, so it should be processed as text.

## Building the approach

Count digits by their residues 0, 1, and 2 modulo 3, and compute the whole digit-sum residue `r`. A first move makes the remainder zero exactly when it deletes a digit of residue `r`. If no such digit exists, S loses immediately.

After a successful first move, the remaining sum is divisible by 3. Every later legal deletion must remove a residue-zero digit, and this remains true after each move. Let `z` be the number of such digits left after S's first move. There are exactly `z` further moves. Including S's first move, S wins precisely when `z` is even.

When `r=0`, the first move itself consumes one residue-zero digit; otherwise it does not. Deleting the last digit is covered because the empty sum is zero.

## Walkthrough

For 1234, the sum has residue 1, so S may delete 1 or 4. One residue-zero digit, 3, remains; T deletes it and S has no move, so T wins. A single 4 can be deleted to empty the number, so S wins. For 33, S deletes one 3 and T deletes the other, so T wins.

## Why it works

Deleting residue `q` changes total residue `r` to `r-q`, which is zero exactly when `q=r`. All possible first digits lie in the same residue class and therefore leave identical residue-class counts. Once the total is zero, only deleting residue zero preserves divisibility; each such move removes exactly one available zero-residue digit. No other strategic choice remains, so the parity of the exact move count determines the last mover and winner.

## Complexity

One scan of `L` digits takes `O(L)` time and `O(1)` extra state beyond the input string.

## Common mistakes

- Deciding from the original string length alone.
- Forgetting to subtract the first residue-zero digit when the initial sum is divisible by 3.
- Treating only digit 3 as residue zero and missing 6 and 9.
- Applying the parity formula when no legal first digit exists.
- Declaring deletion to an empty string illegal.
