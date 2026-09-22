`degree` is one less than the coefficient count. Slicing with `coefficients[:-1]` removes the original constant term, while `degree-index` is the exact power of every remaining original term and therefore its differentiation multiplier.

Each iteration multiplies the previous accumulator by `x` and adds the next derivative coefficient, which is Horner evaluation from highest power to lowest. Python integers do not overflow at a fixed signed width, so negative inputs, large intermediates, and cancellation are all handled exactly. A constant polynomial uses an empty loop and leaves the result at zero.

The main function uses one line iterator: the `for` loop obtains an `x` line and `next(lines)` obtains its following coefficient line. There is no case count, and each pair produces exactly one output line.
