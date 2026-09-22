# Enumerate ordered factor triples and minimize their surface area

## Problem and constraints

Arrange all `N` unit cubes into one solid rectangular box with no gaps and minimize the wrapping-paper area. The three side lengths must be positive integers whose product is exactly `N`; `1 <= N <= 1000`. For dimensions `a,b,c`, the surface area is `2(ab+bc+ca)`.

## Building the approach

Permuting the dimensions changes neither volume nor area, so enumerate only `a<=b<=c`. The smallest side must satisfy `a^3<=N` and divide `N`. After choosing it, `b*c=N/a`; because `b<=c`, we need `b^2<=N/a`, and `b` must divide that remaining product. Then `c` is determined exactly.

For every valid factor triple, compute the six-face surface area and keep the minimum. Integer multiplication conditions avoid floating-point cube-root or square-root boundary errors. The box `1*1*N` always exists, so `6N` is a safe initial upper bound.

## Walkthrough

For `N=27`, dimensions `3*3*3` give surface area `6*9=54`.

For `N=10`, a real-valued cube is irrelevant because dimensions must be integers. Candidate `1*1*10` has area 42, while `1*2*5` has area `2(2+10+5)=34`, which is better. For `N=1`, the inclusive bounds find `1*1*1` and return six.

## Why it works

Every legal integer box can have its dimensions sorted as `a<=b<=c`. Its product constraints imply `a^3<=N`, `a` divides `N`, `b^2<=N/a`, and `b` divides `N/a`, so the loops necessarily visit its sorted triple.

Conversely, each visited pair of divisors yields an integer `c=(N/a)/b`; the loop bound guarantees `c>=b`, and the product is exactly `N`. Thus the enumeration contains all and only legal boxes up to dimension permutation. Taking the smallest surface across this complete set gives the optimum.

## Complexity

The outer bound is `N^(1/3)` and the inner bound is at most `sqrt(N/a)`, giving a simple upper bound of `O(N^(5/6))` trials and `O(1)` extra space. With `N<=1000`, this is very small.

## Common mistakes

- Using the real cube root and ignoring integer dimensions.
- Computing `c` with truncated division without first checking divisibility.
- Forgetting the factor two for opposite faces.
- Using strict loop bounds and missing perfect squares or cubes.
- Starting dimensions above one, leaving prime values with no candidate.
