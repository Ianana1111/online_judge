Each Euclidean remainder is a linear combination of the original a and b. Carry the two coefficients alongside the remainders; the last nonzero remainder gives the gcd and one valid pair.

All pairs then have x=x0+k·b/g and y=y0−k·a/g. The objective |x|+|y| is convex and changes slope only where either coordinate crosses zero. Test the neighboring integers at both crossings, plus k=0. Use floor division for negative numerators, then apply the specified tie order instead of accepting an arbitrary Bézout pair.
