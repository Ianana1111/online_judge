# Normalize the central angle, then compute the minor arc and chord

## Problem and constraints

The Earth has radius 6440 kilometers. A satellite is `s` kilometers above the surface, so its orbital radius is `6440+s`. Given the central angle between two satellites, in degrees (`deg`) or angular minutes (`min`), print the length of the shorter arc and the straight-line chord between them, each with six digits after the decimal point. Input continues until end of file.

Sixty angular minutes equal one degree. Angles may describe more than one turn, but the two satellite positions depend only on the angle modulo 360 degrees.

## Building the approach

Draw the two radii from the Earth's center to the satellites. They form an isosceles triangle, and both requested distances are determined by the same central angle. The key preparation step is therefore to convert the input into the minor angle in radians.

If the unit is `min`, divide by `60.0`. Reduce the degree value modulo 360. If it is greater than 180, replace it by `360-angle`; both angles reach the same pair of points, but the latter describes the shorter arc.

Let the resulting radian angle be `theta` and the orbital radius be `r=6440+s`. By the definition of radians, the arc length is `r*theta`. Bisecting the isosceles triangle creates a right triangle whose opposite side is half the chord, so the chord is `2*r*sin(theta/2)`. This half-angle formula is also numerically better for small angles than subtracting two nearly equal values in a cosine formula.

## Walkthrough

For a height of 500 and an angle of 30 degrees, the radius is 6940 and `theta=pi/6`. The arc is

`6940 * pi/6 = 3633.775503...`,

and the chord is

`2 * 6940 * sin(pi/12) = 3592.408346...`.

An input of 60 angular minutes becomes one degree, not sixty degrees. At zero degrees or a complete turn, the satellites coincide and both distances are zero. At 180 degrees, the chord is the diameter `2r`.

## Why it works

Converting angular minutes to degrees preserves the angle. Removing complete turns preserves both satellite positions, and replacing an angle above 180 degrees with its complement to 360 selects the same endpoints along the shorter side of the circle.

Radians are defined by `theta = arc/r`, so `arc=r*theta` is exact. After bisecting the isosceles triangle, the right triangle has hypotenuse `r`, angle `theta/2`, and opposite side equal to half the chord. The sine definition gives `chord/2 = r*sin(theta/2)`, hence the implemented chord formula. Therefore both printed distances are the requested ones.

## Complexity

Each input record uses a constant number of arithmetic and trigonometric operations, so it takes `O(1)` time and `O(1)` extra space.

## Common mistakes

- Using only the altitude as the radius and forgetting the Earth's 6440 kilometers.
- Dividing angular minutes by 60 with integer arithmetic.
- Passing degrees directly to a sine function that expects radians.
- Keeping an angle above 180 degrees and returning the longer arc.
- Using `sin(theta)` instead of `sin(theta/2)` for the chord.
- Printing the chord before the arc.
