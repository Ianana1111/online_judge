`pi = acosl(-1.0L)` and `root3 = sqrtl(3.0L)` compute the constants in `long double` precision. They are independent of the square size and are calculated once.

For each input, `square = a * a` provides the common scale factor. `striped`, `dotted`, and `rest` apply the three coefficients derived from the coverage equations. Each is calculated from the unrounded square area; no rounded output is fed back into another calculation.

`fixed` with `setprecision(3)` requests exactly three digits after the decimal point. The output order follows the three named region totals, and the EOF loop accepts fractional and zero side lengths without treating either as a terminator.
