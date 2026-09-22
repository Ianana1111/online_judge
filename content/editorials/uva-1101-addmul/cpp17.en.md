`powers[k]` stores `m^k`, and only powers with `q*powers[k] <= s` are evaluated. The low and high formulas use 64-bit endpoint arithmetic; positive numerators use ceiling division, while the outer maximum handles a nonpositive lower requirement.

For every j, `value` rounds low upward to a multiple of `powers[j]`. Base-m decomposition from high position to zero supplies A counts, while `append` discards zero runs and merges adjacent equal instructions. `length` counts expanded instructions without expanding them.

`lexLess` advances simultaneously through run lengths and compares the underlying instruction stream exactly. Overflow guards stop power generation, and `m==1` stops after k zero. Final formatting distinguishes impossible, empty, and a nonempty run list.
