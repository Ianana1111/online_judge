The word “simultaneously” requires separate old and new boards. At the start of each day, copy `grid` to `next`. For each cell, determine the one species that defeats its current species: paper defeats rock, scissors defeats paper, and rock defeats scissors.

Inspect only the four edge neighbors in the old `grid`. If any contains that enemy, write the enemy into the corresponding cell of `next`; otherwise the copied value remains. After every cell has been decided from the same old snapshot, swap the boards.

There is no conflict when several neighbors defeat one cell because each species has exactly one enemy, so all winning neighbors have the same value.

All fights in a day are simultaneous. Read only the old grid and write a new one; each cell checks its four neighbors for the single species that defeats it.
