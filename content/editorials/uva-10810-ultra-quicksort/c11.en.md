An inversion is a pair `i<j` with `a[i]>a[j]`. Each adjacent swap of an inverted neighboring pair removes exactly one inversion, so the minimum swap count equals the initial inversion count.

Scan left to right. When processing `a[i]`, count earlier values greater than it. Sort a copy of all values to compress each into rank one through N. A Fenwick tree stores how many processed elements have each rank.

`prefix(rank)` counts previous values no greater than the current one. Since exactly `i` elements are already processed, `i-prefix(rank)` are greater and form new inversions with current position. Add this number, then insert the current rank.

Minimum adjacent swaps equal inversion count. Compress values into ranks, scan left to right, and use a Fenwick tree to count earlier values no greater than the current one. Subtract from the number already seen.
