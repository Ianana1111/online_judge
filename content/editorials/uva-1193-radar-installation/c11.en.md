Which coast positions cover an island (x,y)? The inequality (position−x)²+y²≤d² gives [x−√(d²−y²), x+√(d²−y²)]. If |y|>d, no coastal radar can cover it.

Now choose the fewest points so that every interval contains one. Sort intervals by right endpoint. If the previous radar lies inside the current interval, keep it; otherwise place a radar at this interval's right endpoint. Moving a required radar farther left cannot help later-ending intervals, so an optimal solution can adopt this choice.

Store endpoints as an integer center, a root sign, and an integer radicand rather than a rounded square root. `one_root` determines the sign of c+k√b: equal signs decide immediately; opposing signs compare c² and k²b. `endpoint_compare`/`compare` reduces a difference of two root endpoints to the same operation, checking signs before squaring.

For speed, C/Java build outward-rounded lower and upper bounds around floating approximations. Only disjoint bound intervals decide an ordering. Close boundaries or values outside floating range always fall back to exact integer comparisons; there is no fixed epsilon. Sorting N intervals takes O(N log N), scanning O(N), and storage O(N), plus integer arithmetic costs.
