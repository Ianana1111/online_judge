Under a 180-degree rotation, cell `(r,c)` corresponds to `(n-1-r,n-1-c)`. If the matrix is flattened row by row, index `i=r*n+c` corresponds exactly to `n*n-1-i`. The geometric test therefore becomes a comparison between the flat array and its reverse.

While reading, mark the case invalid if any value is negative. After all values are consumed, compare every value with its reverse partner. Even if a failure is found early, continue reading the complete case so the next header remains aligned.

Symmetry here means invariance under a 180-degree rotation, so compare the flattened array with its reverse and reject negatives.
