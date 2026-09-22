`degrees` is a `long double`, and dividing by `60.0L` keeps the fractional part of an angular-minute conversion. `fmodl` removes complete turns before the complement step restricts the central angle to the interval from zero through 180 degrees.

The program keeps the radius, radians, and both answers in `long double` through the calculation. `acosl(-1.0L)` supplies a matching high-precision value of pi. The arc uses the radian definition directly, while the chord uses the half-angle sine formula.

Fixed formatting with six decimal places is applied only when printing. An altitude of zero still gives an orbital radius of 6440, and an angle of zero is a valid record rather than an input terminator.
