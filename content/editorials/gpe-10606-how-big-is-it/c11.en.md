Every circle touches the bottom, so its center height equals its radius. For radii r and s, tangent circles have center distance r+s and height difference r−s. Pythagoras gives minimum horizontal separation sqrt((r+s)²−(r−s)²)=2sqrt(rs). Precompute this for every pair.

Enumerate the left-to-right order of centers; there are at most eight circles. For a fixed order, a new center x must be at least its radius to stay inside the left wall, and must satisfy x≥x[j]+gap[i][j] for every previous circle. The largest lower bound gives its leftmost feasible position.

Why place it as far left as possible? Moving a center right only tightens constraints on later centers and cannot improve the right boundary. Thus these greedy positions are optimal for a fixed order. Check all previous circles, not just adjacent ones: small circles between two large ones do not remove the large circles' mutual restriction.

Track the current right boundary as max(x+r). If it is already at least best, adding circles cannot improve it, so prune the branch. Twice the sum of radii is a feasible initial upper bound. Sorting also lets us skip duplicate permutations of equal radii. Worst-case enumeration takes O(n! n²) time and O(n²) extra space. Use standard square roots and print three decimal places; exact midpoint ties accept either equally near rounded value.
