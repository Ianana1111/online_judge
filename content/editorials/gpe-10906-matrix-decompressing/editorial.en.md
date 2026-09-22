# Remove the lower bound before sending flow

## Problem and constraints

Reconstruct an R-by-C integer matrix from cumulative row sums and cumulative column sums, with R,C ≤ 20. Every cell must lie between one and twenty. There are at most 100 cases, and a solution is guaranteed. Print any valid matrix under its `Matrix` case heading; it need not match a particular reference arrangement.

## Building the approach

First undo accumulation: subtract the preceding cumulative value from each entry to get an individual row or column sum. Then handle the cell lower bound before allocating the rest. Put one in every cell, subtract C from each row demand and R from each column demand, and let each cell receive an extra zero through nineteen.

Now build source → row → column → sink flow. Source-to-row capacity is that row's remaining demand; each row-to-column edge has capacity nineteen; column-to-sink capacity is that column's remaining demand. A unit of middle-edge flow adds one to the corresponding cell.

This enforces both sets of sums simultaneously. Filling rows greedily from left to right can exhaust a column needed later; residual edges allow earlier allocations to be adjusted. The guaranteed feasible input ensures maximum flow satisfies all remaining demand.

## Walkthrough

For a two-by-two matrix, let both cumulative lists be `4, 8`. Every individual row and column sums to four. After placing the baseline ones, every row and column still needs two. Both `[[1,3],[3,1]]` and `[[2,2],[2,2]]` meet the requirements and should be accepted.

## Why it works

Subtracting one from every cell maps any valid matrix to an integral flow with each middle edge between zero and nineteen and with exactly the adjusted row and column totals. Conversely, a full-demand integral flow saturates the row and column demand edges. Adding one back gives cells from one through twenty with the required individual sums. Reaccumulating those sums reproduces the input cumulative lists, proving the construction equivalent to the original problem.

## Complexity

There are V = R + C + 2 ≤ 42 vertices and E = RC + R + C ≤ 440 forward edges. General Dinic takes O(V²E) time and O(V + E) space. Saved cell-edge indices use O(RC) space.

## Common mistakes

- Treating cumulative entries as individual sums.
- Allowing zero-valued cells.
- Giving the extra-flow edge capacity twenty and producing a cell value of twenty-one.
- Satisfying rows without satisfying columns.
- Rejecting a different valid matrix because its text differs from a reference output.
