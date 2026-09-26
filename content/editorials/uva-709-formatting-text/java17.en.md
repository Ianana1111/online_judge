First choose line breaks, then distribute spaces. For g gaps and S spaces on a line, use q=S/g and r=S%g: g−r gaps have length q and r have q+1. This minimizes the sum of (gap−1)². Place shorter gaps first to minimize the gap sequence among equal-cost distributions.

Let cost[i] be the minimum penalty for formatting words from i onward. Enumerate the next line's last word j while letters plus required gaps fit the width, then compare the local penalty plus cost[j+1]. A singleton line costs 500 unless its word exactly fills the width. Compute backward for the global minimum.

Equal costs require comparing the entire remaining gap sequence, not only the current line. A line contributes at most two runs of equal gaps, so store persistent runs sharing their suffix. `append` merges equal adjacent runs and interns the complete (gap, repetitions, suffix node) key. Hash collisions compare full keys; equality is exact.

`Cursor` reads a candidate line's at most two runs, then its previously solved suffix. Compare whole matching runs without expanding individual gaps, and stop when both suffix nodes are identical. If one sequence prefixes the other, the longer one wins by the problem's tie rule. Create at most two nodes only for the winning candidate, avoiding copied suffixes at every position.

`following` reconstructs lines. Fully justify the last line too, without leading or trailing spaces. Cost computation takes O(NW); tie comparisons add the number of runs actually examined, with O(N²W) worst-case time. Shared sequences and DP use O(N) space under the local text-size limits.
