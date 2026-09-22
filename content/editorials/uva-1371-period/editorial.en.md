# Binary-search the maximum edit distance and restart DP at legal cuts

## Problem and constraints

Partition text `x`, length up to 5,000, into nonempty contiguous pieces. Every piece must have Levenshtein distance at most `k` from pattern `y`, length up to 50. Minimize the maximum allowed `k`; piece lengths are unrestricted and insertion, deletion, and substitution all cost one.

## Building the approach

Feasibility is monotone in k, so binary-search from zero through `|y|`; single-character pieces prove the upper bound. Scan x while maintaining an edit-distance row for unfinished pieces beginning at any previously feasible cut.

After extending by one text character with the usual three transitions, `current[m]<=k` means the current prefix can end a legal piece. Only then permit a new piece to start here by minimizing each `current[j]` with `j`, the distance from an empty new piece to the first j pattern characters. Check completion before this reset so pieces remain nonempty.

## Walkthrough

For `y=abc`, text `abcdabcabb` can split into `abcd,abc,abb`, with distances 1,0,1. For `y=ab`, text `aab` may split as `a,ab`; fixed two-character chunks cannot express it.

## Why it works

Before each character, the row contains minimum edit costs of all unfinished pieces starting after feasible prefixes. Standard Levenshtein transitions extend exactly those pieces. A bounded full-pattern cost detects precisely a legal new cut, whose empty-piece initialization is then added without discarding better unfinished states. Every legal partition's last piece originates at such a preserved cut, and no illegal prefix creates one. Thus the final completion flag exactly characterizes feasibility, and binary search returns the minimum bound.

## Complexity

One check costs `O(|x||y|)` time and `O(|y|)` space. Binary search gives `O(|x||y| log(|y|+1))` total time.

## Common mistakes

- Cutting only at multiples of pattern length.
- Minimizing the sum rather than maximum piece distance.
- Restarting at prefixes that are not feasible.
- Resetting before checking completion and accepting empty pieces.
- Initializing only the empty-pattern column at a cut.
