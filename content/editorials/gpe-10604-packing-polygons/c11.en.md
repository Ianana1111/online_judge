If every polygon vertex lies inside a circle, its edges and interior do too, since a circle is convex. Find the minimum enclosing circle of the vertices, then compare its radius with R.

A minimum circle is determined by one point, a two-point diameter, or a three-point circumcircle. Shuffle the points and add them incrementally. An inside point changes nothing. An outside point becomes a boundary point while earlier points are rescanned. A second outside point gives a diameter circle; a third outside point gives a circumcircle. For collinear triples, use the largest of their pairwise diameter circles.

`outside` tests strict exclusion; a point exactly on the circle is accepted. Avoid rounded centers near boundaries or large coordinates. `Circle` stores center numerators x,y, a common positive denominator d, and squared-radius numerator r. A point is outside exactly when (p_x d−x)²+(p_y d−y)² > r.

`through_three` uses determinants and normalizes the denominator sign. Parse the input radius as an exact decimal fraction and compare squared radii by cross multiplication, without epsilon. Randomized incremental construction averages O(N) geometric operations, with O(N³) worst-case time and O(N) storage, plus exact integer arithmetic costs.
