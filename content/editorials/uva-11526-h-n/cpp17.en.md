The nonpositive branch occurs before any root or division. Two correction loops establish the exact invariant `root^2<=n<(root+1)^2` even if `sqrtl` rounds near a boundary.

`sum` stores only the first strip; the final expression doubles it and subtracts the intersection. Both loop variables and `n` are `long long`, so `/` is exact integer division and the total does not overflow 32 bits.
