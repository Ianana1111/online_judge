Feasibility is monotone in k, so binary-search from zero through `|y|`; single-character pieces prove the upper bound. Scan x while maintaining an edit-distance row for unfinished pieces beginning at any previously feasible cut.

After extending by one text character with the usual three transitions, `current[m]<=k` means the current prefix can end a legal piece. Only then permit a new piece to start here by minimizing each `current[j]` with `j`, the distance from an empty new piece to the first j pattern characters. Check completion before this reset so pieces remain nonempty.

Binary-search the maximum allowed edit distance k. While scanning the text, track edit distances from valid cut positions to each pattern prefix; when a segment may end here, make this position an available start for the next segment.
