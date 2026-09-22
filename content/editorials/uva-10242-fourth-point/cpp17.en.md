`millimetres` parses a coordinate, multiplies it by 1000, and uses `llround` to recover the exact integer millimeter value instead of truncating a slightly inexact binary representation. Under the coordinate bound this conversion is reliable; all later vector arithmetic is integral.

The nested loops compare each endpoint of the first side with each endpoint of the second side, so they find the shared point regardless of input position. For each axis, the code adds all four coordinates and subtracts three copies of the common coordinate, implementing `A+B-P`.

`printCoordinate` handles the sign separately, then splits the nonnegative magnitude into meters and millimeters. Width-three zero padding prints values such as five millimeters as `.005`, while checking the sign before taking the magnitude prevents a negative representation of zero.
