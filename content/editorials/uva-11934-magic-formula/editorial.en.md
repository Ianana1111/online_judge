# Test every integer input from zero through the inclusive limit

## Problem and constraints

For quadratic `f(x)=ax^2+bx+c`, divisor `d`, and limit `L`, count integers `x=0..L` whose function value is divisible by `d`. Coefficients may be negative, `d>1`, and `L<1000`. Five zeros terminate input; individual zero coefficients or limit are valid.

## Building the approach

The range has at most 1,000 inputs, so enumerate all of them. Evaluate with Horner form `(a*x+b)*x+c` and increment the answer when `value%d==0`. Count inputs, even when several produce the same output.

C++ may return a negative remainder for negative values, but divisibility depends only on equality with zero, so no normalization is required. A zero polynomial value is divisible by every nonzero `d`.

## Walkthrough

If `a=b=0`, `c=10`, `d=5`, and `L=100`, all 101 inputs qualify; repeated function values still count separately. If `L=0`, `f(0)=c` is checked once and may contribute one.

## Why it works

The inclusive loop visits each required integer exactly once. Horner expansion equals the original quadratic. For nonzero `d`, integer remainder zero is equivalent to being an integer multiple of `d`, so each increment corresponds exactly to one qualifying input and the final count is correct.

## Complexity

Each case takes `O(L)` time and `O(1)` space.

## Common mistakes

- Starting at one and omitting `f(0)`.
- Using `x<L` and omitting the upper endpoint.
- Deduplicating equal function values.
- Treating any zero field as termination.
- Using a sign condition instead of remainder equality.
- Performing modulo zero before recognizing the sentinel.
