For positive subexpressions `X,Y,Z`, compare `X+Y*Z` with `(X+Y)*Z`. The second is larger by `X(Z-1)`, which is nonnegative. Likewise, moving multiplication inside an addition can only reduce or preserve the result. These local transformations push every maximum toward addition-before-multiplication and every minimum toward multiplication-before-addition.

For the maximum, sum every run connected by plus signs, then multiply those groups. For the minimum, multiply every run connected by multiplication signs, then add those groups.

One `evaluate` function can receive the operator to process first. It accumulates a current `group`; when the other operator appears, it combines the completed group into the answer and starts a new one. The final group must also be combined after the scan.

All values are positive. Addition before multiplication maximizes the expression; multiplication before addition minimizes it. Evaluate runs of the priority operator as groups, then combine groups.
