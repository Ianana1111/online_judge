After swapping, `m` is the short side and the maximum diagonal length. `straight` combines both orthogonal directions; the two terms in `diagonal` cover shorter diagonals and the repeated maximum-length diagonals, already including both orientations and queen order.

For `m=1`, factors containing `m-1` make diagonal contributions zero without a special case. The loop stops only for two zeros, and the final total is neither halved nor doubled again.
