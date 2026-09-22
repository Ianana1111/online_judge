# Differentiate the coefficients and evaluate them with Horner's method

## Problem and constraints

Input alternates between a line containing `x` and a line containing polynomial coefficients from highest degree to the constant term. For each pair, print the derivative evaluated at `x`. Input continues until end of file. Input values and the final result have absolute value below `2^31`, but intermediate arithmetic is not promised to fit in 32 bits.

If there are `n+1` coefficients, the polynomial has degree `n`. Coefficient `a[i]` belongs to power `n-i`, so differentiation changes it to `a[i]*(n-i)` and lowers its power by one. The final constant coefficient contributes nothing.

## Building the approach

After differentiation, the problem is simply evaluating another polynomial. Computing each power of `x` separately repeats work and risks using an inexact floating-point power function. Horner's method rewrites a derivative such as

`3a*x^2 + 2b*x + c`

as

`(3a*x + 2b)*x + c`.

Start `value` at zero and scan every original coefficient except the constant. At index `i`, its original power is `degree-i`, so update

`value = value*x + coefficient*(degree-i)`.

When the scan ends, `value` is the derivative at `x`. Python's arbitrary-precision integers preserve intermediate values even when cancellation makes the final result much smaller.

## Walkthrough

For `x=2` and coefficients `1 1 1`, the polynomial is `x^2+x+1` and the derivative is `2x+1`. Horner's updates are `0*2+1*2=2`, then `2*2+1*1=5`, so the answer is five.

For coefficients `1 -1`, the derivative of `x-1` is always one, so the single update returns one. If the coefficient line contains only a constant, the scan is empty and the initial zero is the correct derivative.

## Why it works

Let the derivative coefficients in descending order be `b0,b1,...`. After processing the first `k` coefficients, Horner's accumulator equals

`b0*x^(k-1) + b1*x^(k-2) + ... + b(k-1)`.

This is true after the first update. Multiplying by `x` raises every existing power by one, and adding the next coefficient establishes the same statement for `k+1`. By induction, after all derivative coefficients are processed, the accumulator is exactly the derivative polynomial evaluated at `x`. The weights `degree-i` construct every derivative coefficient correctly, while excluding the constant term.

## Complexity

With `n+1` coefficients, the algorithm performs `O(n)` integer multiply-add operations and stores `O(n)` coefficients. Python integer operations also depend on the number of bits in intermediate values; no separate table of powers is built.

## Common mistakes

- Evaluating the original polynomial instead of its derivative.
- Forgetting to multiply a coefficient by its original power.
- Reading the coefficients in ascending-power order.
- Including the constant term in the derivative scan or omitting the original linear term.
- Using floating-point `pow` for an integer result.
- Assuming that a 32-bit final answer implies all intermediate values fit in 32 bits.
