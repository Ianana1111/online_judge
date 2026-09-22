The start, finish, centers, and direction use integer coordinates. `a` is the nonzero squared flight length. Because `b` is defined without the usual factor of two, the discriminant is `b*b-a*c` and the roots divide by `a`, exactly as written.

The code skips `D<=0`, since a tangent has zero path length. For positive discriminant it computes the entry and exit parameters, clamps the lower endpoint to zero and the upper endpoint to one, and takes zero when the clipped interval is empty.

`fraction` directly accumulates parameter lengths. Multiplying it by 100 is sufficient; no physical-distance square root is needed. Each data set prints the city name and a fixed two-decimal percentage without extra separator lines.
