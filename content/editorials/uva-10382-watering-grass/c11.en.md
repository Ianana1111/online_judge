A sprinkler lies on the strip's center line. To cover its full width, use the circle's intersections with the strip boundaries. Radius r and strip width w give the useful horizontal interval [x−√(r²−w²/4), x+√(r²−w²/4)]. A radius at most w/2 covers no positive-length section.

Find a minimum interval cover of [0,L]. Sort by left endpoint and maintain the rightmost covered position. Among all intervals starting at or before it, select the farthest right endpoint. Every feasible next step must use one of these intervals, and the farthest reach cannot worsen later choices. If none extends coverage, a gap makes the answer −1.

Double all horizontal endpoints and represent them as 2x±√(4r²−w²), avoiding fractions. Zero strip length needs zero sprinklers, and intervals touching exactly can be joined.

Store endpoints as an integer center, a root sign, and an integer radicand rather than a rounded square root. `one_root` determines the sign of c+k√b: equal signs decide immediately; opposing signs compare c² and k²b. `endpoint_compare`/`compare` reduces a difference of two root endpoints to the same operation, checking signs before squaring.

For speed, C/Java build outward-rounded lower and upper bounds around floating approximations. Only disjoint bound intervals decide an ordering. Close boundaries or values outside floating range always fall back to exact integer comparisons; there is no fixed epsilon. Sorting N intervals takes O(N log N), scanning O(N), and storage O(N), plus integer arithmetic costs.
