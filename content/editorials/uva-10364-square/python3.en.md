Let `side=total/4`. Build one side at a time. A bitmask records which sticks have been used, and `remainder[mask]` records the length already placed on the current unfinished side. Unreachable masks contain `-1`; the empty set is reachable with remainder zero.

From a reachable mask, try every unused stick whose length does not make the current side exceed `side`. The next remainder is `(current+stick)%side`: reaching exactly `side` resets it to zero and begins a new side.

We do not need to store multiple remainders for one mask. The total length represented by a mask is fixed, so any valid ordering reaches the same remainder modulo `side`. This merges different placement orders without losing future possibilities.

The Python version tries sticks from longest to shortest and memoizes failed used-stick bitmasks. Completing a side resets its filled length to zero; equal-length sticks are tried only once per state to avoid symmetric permutations.
