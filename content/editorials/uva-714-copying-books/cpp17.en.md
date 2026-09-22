Feasibility starts with one group and opens another only when `current+x > limit`; equality remains allowed. The lower bound already covers every single book, so no individual value can exceed a tested feasible limit.

During reverse reconstruction, `groups` is the number still required and `i+1` the remaining book count including the current book. Condition `i+1 < groups` forces a split after the current right-side accumulation so enough books remain. `split[i]` means print a slash after book `i`, and the output loop supplies the exact spaces around numbers and slashes.
