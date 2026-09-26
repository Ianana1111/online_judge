Every circle touches the bottom, so its center height equals its radius. For radii r and s, tangent circles have center distance r+s and height difference r−s. Pythagoras gives minimum horizontal separation sqrt((r+s)²−(r−s)²)=2sqrt(rs). Precompute this for every pair.

Enumerate the left-to-right order of centers; there are at most eight circles. For a fixed order, a new center x must be at least its radius to stay inside the left wall, and must satisfy x≥x[j]+gap[i][j] for every previous circle. The largest lower bound gives its leftmost feasible position.

Why place it as far left as possible? Moving a center right only tightens constraints on later centers and cannot improve the right boundary. Thus these greedy positions are optimal for a fixed order. Check all previous circles, not just adjacent ones: small circles between two large ones do not remove the large circles' mutual restriction.

Track the current right boundary as max(x+r). If it is already at least best, adding circles cannot improve it, so prune the branch. Twice the sum of radii is a feasible initial upper bound. Sorting also lets us skip duplicate permutations of equal radii. Worst-case enumeration takes O(n! n²) time and O(n²) extra space. Use standard square roots and print three decimal places; exact midpoint ties accept either equally near rounded value.


Input may repeat the same multiset of radii. Python sorts it into a tuple and caches at most 50 geometric results. Reordering input circles does not change the optimum. A new multiset still receives the full search.


Python also computes tail(last,remaining) by subset DP, temporarily imposing only adjacent-circle separations. This is a lower bound on the remaining width, not a valid final answer: nonadjacent circles might still collide. The search keeps every geometric check and uses the bound only to prioritize promising orders and prune branches unable to improve best, retaining a 1e−9 floating-point buffer. The bound table has O(2^n n) states and takes O(2^n n²) time.
