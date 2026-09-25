Draw the two radii from the Earth's center to the satellites. They form an isosceles triangle, and both requested distances are determined by the same central angle. The key preparation step is therefore to convert the input into the minor angle in radians.

If the unit is `min`, divide by `60.0`. Reduce the degree value modulo 360. If it is greater than 180, replace it by `360-angle`; both angles reach the same pair of points, but the latter describes the shorter arc.

Let the resulting radian angle be `theta` and the orbital radius be `r=6440+s`. By the definition of radians, the arc length is `r*theta`. Bisecting the isosceles triangle creates a right triangle whose opposite side is half the chord, so the chord is `2*r*sin(theta/2)`. This half-angle formula is also numerically better for small angles than subtracting two nearly equal values in a cosine formula.

Convert minutes to degrees, normalize modulo 360, and choose the angle no greater than 180 degrees. Then use arc length rθ and chord length 2r sin(θ/2), with θ in radians.
