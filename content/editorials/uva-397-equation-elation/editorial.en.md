# Reduce the expression one visible operation at a time

## Problem and constraints

Each line is an integer expression followed by `=` and a variable name. It contains 1 to 20 binary operators from `+`, `-`, `*`, and `/`; operands may have one unary sign and spacing is optional. Every division is exact. Print the initial expression and every intermediate state while evaluating all multiplication and division from left to right, then all addition and subtraction from left to right.

## Building the approach

The output requires the whole calculation history, so store operands and operators in parallel arrays: operator `i` always sits between `values[i]` and `values[i+1]`. Parsing must alternate between expecting a signed integer and a binary operator. That distinction makes the minus in `2*-3` part of an operand while the minus in `12-4` remains an operation.

At each step, find the leftmost `*` or `/`. If none remains, select operator zero, which is the leftmost `+` or `-`. Evaluate its two adjacent operands, replace them with the result, remove that operator, and render the complete arrays. The arrays remain interleaved after every reduction.

Using this explicit selection encodes both precedence and left associativity. Exact integer division avoids any floating-point loss, including for large operands.

## Walkthrough

`12+2*12/2-1=y` becomes `12+24/2-1`, then `12+12-1`, then `24-1`, and finally `23`. For `10-3-2=x`, equal-precedence subtraction is left-associative: first `7-2`, then `5`; evaluating `3-2` first would incorrectly produce 9.

## Why it works

Alternating parsing produces one more value than operator and associates every unary sign with the correct operand. At each iteration, the selection rule chooses exactly the next operation mandated by precedence and left associativity. Replacing that subexpression with its exact result preserves the expression's value while removing one operator. By induction, every rendered state is the required next calculation state, and after finitely many reductions only the final value remains.

## Complexity

With `K <= 20` operators, repeated searches and array deletions take `O(K^2)` time, in addition to the required output size and big-integer arithmetic. Stored tokens use `O(KD)` space when intermediate integers have up to `D` digits.

## Common mistakes

- Parsing a binary minus as the sign of the following operand.
- Performing a left addition while multiplication remains later in the expression.
- Evaluating equal-precedence subtraction or division from right to left.
- Printing only the final value instead of every state.
- Using floating point for exact, potentially large integer division.
