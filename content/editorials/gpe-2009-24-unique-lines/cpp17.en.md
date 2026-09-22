`Integer` is the GCC toolchain's `__int128`. Coordinates are converted before subtraction and multiplication, so an intermediate value cannot overflow in 64-bit arithmetic first. The coefficient `c` fits the 128-bit range for products and differences of signed 64-bit coordinates.

`gcdInteger` works with magnitudes and Euclid's algorithm. Distinct points ensure that `a` and `b` are not both zero, so the common divisor is positive. The nested loops use only `j<i`, avoiding self-pairs and duplicate point-pair orderings. A fresh normalized-triple set is created for every case.
