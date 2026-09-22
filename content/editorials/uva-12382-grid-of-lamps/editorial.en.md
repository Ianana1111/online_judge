# Derive the minimum lamp count from bipartite cut bounds

## Problem and constraints

An `M` by `N` binary grid has lower bounds on lit lamps in every row and column, not exact totals. Each cell can be lit once. With both dimensions up to 1,000, find the minimum number of lit cells satisfying all bounds.

## Building the approach

Sort row demands `a` descending and let `prefix[k]` be the sum of the largest `k`. For any `k`, those rows require at least `prefix[k]` lamps. Column `j` can receive at most `k` of its demand from them, so the other rows still require at least `max(b[j]-k,0)` lamps for that column. Thus every solution has at least `F(k)=prefix[k]+sum max(b[j]-k,0)` lamps, and max-flow/min-cut shows the maximum of these bounds is attainable.

Evaluate every `k` without building a million cell edges. Initially `excess=sum b` for `k=0`. Keep how many columns still have positive excess; increasing `k` reduces each such excess by one. A frequency table removes columns when their demand reaches `k`, while the row prefix adds the next largest demand.

## Walkthrough

With row demands `2,0` and column demands `0,2`, both side totals are two, yet two lamps cannot satisfy both: the first row needs both cells, then the second column still needs one lamp in row two. At `k=1`, the formula gives `2+0+1=3`, the true answer.

## Why it works

In a bipartite flow view, a unit through a row-cell-column path represents one lamp satisfying one unit on both sides. Minimizing total lamps is equivalent to maximizing these shared units. For a cut containing `k` row vertices, choosing the largest `k` row demands minimizes its capacity, while each column contributes `min(b[j],k)`. Substituting this min-cut value into `rowSum+columnSum-maxFlow` simplifies exactly to the maximum `F(k)`, proving both the lower bound and attainability. The incremental scan evaluates that same expression for every `k`.

## Complexity

Sorting rows costs `O(M log M)`; building column frequencies and scanning all `k` costs `O(M+N)`. Extra space is `O(M)`.

## Common mistakes

- Treating lower bounds as exact degrees.
- Taking only the larger of the row and column totals.
- Sorting row demands ascending.
- Removing demand-`k` columns before subtracting their last excess unit.
- Omitting the `k=0` column-only bound.
