Deleting people from an array works conceptually but repeatedly shifts entries. We only need the final survivor, so undo the eliminations instead.

When one person remains, their local zero-based position is zero. Suppose an elimination with step p reduces a circle of size s to size s − 1. The next round starts at old position `p mod s`. A survivor at new position j therefore came from old position `(j + p) mod s`.

The delicate part is choosing p. This is not a fixed-step Josephus problem, and a smaller remaining circle does not restart the prime sequence at two. In the original n-person game, the round with s people occurs after n − s eliminations, so it uses zero-based prime `primes[n − s]`. Restore sizes from two up to n using that index, then add one to return to the original labels.

Precompute needed primes, reconstruct the survivor’s zero-based position as group size grows, then convert to one-based numbering.
