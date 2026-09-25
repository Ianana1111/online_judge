Student `i` needs `ceil(y_i/S)` visits, so feasibility requires `S>=max(y)/3`. A visit count changes only at `S=y_i/k` for `k=1,2,3`. Between consecutive breakpoints all visit counts are fixed, while cost increases with `S`, so an optimum occurs at a breakpoint. Enumerate each occurring appetite `p` and denominator `q` from 1 through 3.

Build appetite frequencies and prefix counts. For `S=p/q`, students with `y<=S` visit once, those with `S<y<=2S` twice, and the rest three times. Therefore total visits are

`Y = 3n - count(y<=S) - count(y<=2S)`.

Multiplying cost by `q` gives numerator `(a*p+b*q)Y - a*sum(y)*q`. Compare candidates by cross multiplication, avoiding floating point, and reduce the final fraction.

Only test portion sizes equal to an appetite divided by one, two, or three. Prefix counts give each candidate’s visit total in O(1); compare exact cost fractions by cross multiplication and reduce the winner.
