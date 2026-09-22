The zero-initialized Pascal table sets `choose[n][0] = 1` and builds other entries from the previous row, so impossible cases with `k > n` remain zero. Input is guaranteed lowercase with length at most five; `valid` only needs to enforce strict adjacent increase.

`previous = -1` makes the first candidate range begin at letter index zero. Candidates stop before `current`, and only after their entire earlier branches are counted does `previous` advance. There are `25 - candidate` letters strictly after a chosen candidate, which is the pool used for the remaining combination.
