# Addition first maximizes; multiplication first minimizes

## Problem and constraints

Each expression contains up to twelve positive integers from 1 through 20, joined only by `+` and `*`, with no parentheses. Parentheses may be inserted without reordering any number or operator. Find the maximum and minimum possible results. Positivity is essential: the simple priority conclusion would not generally hold with zero or negative values.

## Building the approach

For positive subexpressions `X,Y,Z`, compare `X+Y*Z` with `(X+Y)*Z`. The second is larger by `X(Z-1)`, which is nonnegative. Likewise, moving multiplication inside an addition can only reduce or preserve the result. These local transformations push every maximum toward addition-before-multiplication and every minimum toward multiplication-before-addition.

For the maximum, sum every run connected by plus signs, then multiply those groups. For the minimum, multiply every run connected by multiplication signs, then add those groups.

One `evaluate` function can receive the operator to process first. It accumulates a current `group`; when the other operator appears, it combines the completed group into the answer and starts a new one. The final group must also be combined after the scan.

## Walkthrough

For `1+2*3*4+5`, the maximum is `(1+2)*3*(4+5)=81`. The minimum is `1+(2*3*4)+5=30`.

A single number gives the same minimum and maximum. For `1*1+1`, both valid extremes equal two, showing that the two rules need not produce different values.

## Why it works

View any parenthesization as a binary expression tree. The inequalities above allow a plus operation to be moved inside adjacent multiplication when maximizing without decreasing the value. Repeating this transformation eventually places multiplication outside all addition groups, exactly the addition-first evaluation.

The reverse transformations do not increase a value and end with addition outside multiplication groups, exactly the multiplication-first evaluation. Since regrouping a run of only additions or only multiplications does not change its value, the two linear evaluations attain the global extrema.

## Complexity

Parsing and two scans take `O(K)` time for `K` values and use `O(K)` storage. The stated limits fit signed 64-bit arithmetic.

## Common mistakes

- Using the programming language's standard precedence for both answers.
- Swapping which priority produces the maximum.
- Storing products in 32-bit integers.
- Parsing a two-digit value as separate digits.
- Forgetting to combine the final group.
