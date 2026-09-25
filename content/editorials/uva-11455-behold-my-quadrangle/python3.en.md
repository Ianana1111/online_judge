Sort the sides as `a<=b<=c<=d`. If `a==d`, all four are equal and can form a square. Otherwise, if `a==b` and `c==d`, two equal pairs can form a rectangle. Otherwise a nondegenerate quadrangle exists exactly when the longest side satisfies `d<a+b+c`.

The inequality must be strict: equality forces a collapsed straight line. Use 64-bit values before adding the three sides because their sum can exceed signed 32-bit range.

Sort sides first, then classify square, rectangle, or general quadrangle; the longest side must be shorter than the other three combined.
