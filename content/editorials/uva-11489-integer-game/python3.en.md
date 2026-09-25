Count digits by their residues 0, 1, and 2 modulo 3, and compute the whole digit-sum residue `r`. A first move makes the remainder zero exactly when it deletes a digit of residue `r`. If no such digit exists, S loses immediately.

After a successful first move, the remaining sum is divisible by 3. Every later legal deletion must remove a residue-zero digit, and this remains true after each move. Let `z` be the number of such digits left after S's first move. There are exactly `z` further moves. Including S's first move, S wins precisely when `z` is even.

When `r=0`, the first move itself consumes one residue-zero digit; otherwise it does not. Deleting the last digit is covered because the empty sum is zero.

The first removed digit must match the total residue mod three; afterward only residue-zero digits are legal, so parity decides the winner.
