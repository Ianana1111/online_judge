An inversion is a pair `i<j` with `a[i]>a[j]`. Swapping one adjacent inverted pair removes exactly that inversion and does not change the total inversion relation with any third element. Therefore every move decreases the inversion count by exactly one. The game ends only at sorted order with zero inversions, so its length is fixed at the initial inversion count regardless of choices.

An odd count lets Marcelo make the final move; an even count lets Carlos win. Count inversions with a Fenwick tree from left to right. Before value `x`, `i-query(x)` previous elements are greater than `x`, giving the new inversions whose right endpoint is current. Use 64 bits for the total.

Bubble-sort swaps equal inversions; for current x, subtract prior values no greater than x from the number already read.
