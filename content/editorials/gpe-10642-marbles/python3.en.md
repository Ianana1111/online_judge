Balls are distinct and boxes are labeled, with at least X balls per box. This is not merely an integer partition: a fixed list of box sizes can correspond to many assignments of actual balls.

Let f(k,n) count assignments of n balls to k boxes. Examine the final ball. If removing it leaves its box with at least X balls, it can join any of k boxes in a valid assignment of n−1 balls: k·f(k,n−1). Otherwise its box originally had exactly X balls. Choose the box in k ways, choose X−1 companions from the other n−1 balls, and distribute the remaining balls among k−1 boxes: k·C(n−1,X−1)·f(k−1,n−X).

The cases are disjoint and exhaustive, so add them. Initialize f(0,0)=1; fewer than kX balls gives zero. current stores the current box count and previous the preceding count. Since current[n−1] is needed, scan ball counts upward.

For X=1, inclusion-exclusion starts from k^n, subtracts assignments omitting a selected box, then restores intersections. One box with N≥X has one assignment. Group other queries by (k,X), compute once through their largest N, and reserve enough balls for later boxes to avoid irrelevant states.

Factorials and inverse factorials provide combinations modulo prime 1000000007. All n≤100000, so factorials contain no modulus factor. Each general query group takes O(kN) time and O(N) rolling memory, with O(100000) combination tables.
