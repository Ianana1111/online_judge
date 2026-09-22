# Evaluate a prefix expression from right to left

## Problem and constraints

Each line is a prefix arithmetic expression made from positive decimal integer literals and binary `+ - * / %`. Tokens are separated by whitespace, a line contains at most 1024 characters, and a line containing only `.` ends input. Invalid expressions print `illegal`. Literals must be greater than zero and cannot include a sign; intermediate results may be zero or negative. Division truncates toward zero, and a zero divisor makes either division or remainder illegal.

## Building the approach

Scanning prefix notation from the left encounters an operator before its operands. Scanning from the right reverses that difficulty: by the time an operator is reached, both complete operand expressions have already been evaluated.

Maintain a stack. A valid positive integer becomes one completed expression and is pushed. For an operator, at least two values must exist. The first pop is the left operand and the second is the right operand, because the scan direction is reversed. Apply the operator and push its result. After all tokens, exactly one value must remain; zero values indicate an empty or incomplete expression, and multiple values indicate extra independent expressions.

Python's `//` rounds negative quotients downward, but this platform truncates toward zero. Divide absolute values, restore the sign, and compute remainder as `a - quotient*b`.

## Walkthrough

For `- * + 23 % 45 10 6 / 77 12`, evaluate `45%10=5`, then `23+5=28`, multiply by six to get 168, and compute `77/12=6`; the final answer is 162.

`+ 1` is missing an operand, while `1 2` leaves two independent values. Both are illegal. For `/ - 1 8 3`, the numerator is `-7`, and truncation toward zero produces `-2`, not Python floor division's `-3`.

## Why it works

After processing any suffix from right to left, the stack contains the values of complete subexpressions in that suffix that have not yet been consumed by a parent. A positive literal creates exactly one such subexpression. An operator consumes the nearest left and right subexpressions in the correct order and replaces them with the value of their parent, preserving the invariant.

An operator with fewer than two values cannot have the required children. At the end, exactly one stack entry is equivalent to one complete expression tree; any other count is structurally invalid. The explicit quotient construction and remainder identity implement the platform's arithmetic semantics, including negative results.

## Complexity

For `T` tokens, each token is pushed or popped a constant number of times, so structural work and stack space are `O(T)`. Big-integer arithmetic adds cost according to operand size.

## Common mistakes

- Reversing the left and right operands for subtraction, division, or remainder.
- Returning the stack top without checking for extra values.
- Using Python `//` and `%` directly on negative intermediate results.
- Accepting `-3` as a literal instead of a binary operator followed by operands.
- Crashing on a zero divisor instead of printing `illegal`.
