A connected graph first needs `N-1` tree edges; let `E=M-(N-1)` be the excess. Concentrate every cycle-producing edge in a core of `k` vertices and attach the other `N-k` vertices as a tree, leaving `N-k` bridges. A `k`-vertex core can hold at most `C(k,2)-(k-1)=(k-1)(k-2)/2` excess edges.

Binary-search the smallest `k` whose capacity is at least `E`; the answer is `N-k`. For `E=0`, `k=1` correctly gives a tree's `N-1` bridges.

Keep the N−1 edges needed for connectivity. Extra edges must lie inside a bridge-free core. Binary-search the smallest core size k able to hold them; the maximum bridge count is N−k.
