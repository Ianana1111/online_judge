# Parse and evaluate expressions with the platform's precedence

## Problem and constraints

Each input line is an independent arithmetic expression containing nonnegative decimal integers, parentheses, unary signs, and binary `+ - * / %`. A line has fewer than 1024 characters. This platform explicitly defines left-associative binary operations and the precedence, from high to low, as unary signs, remainder, multiplication/division, and addition/subtraction. Invalid syntax and division or remainder by zero produce `syntactically incorrect`. Division truncates toward zero, and remainder is `a - trunc(a/b) * b`.

## Building the approach

The main risk is accepting text that only resembles an expression. Track whether the parser is currently expecting an operand. In that state, a number or `(` may begin an operand, and `+` or `-` is a unary sign. After a number or `)`, the parser expects a binary operator or the end. This rejects adjacent numbers, implicit multiplication, empty groups, and missing operands.

Use one stack for values and one for operators. Encode unary signs as `u+` and `u-`. Before pushing a binary operator, apply stacked operators of greater or equal precedence; the equality case implements left associativity. A left parenthesis blocks outside operations. A right parenthesis applies everything inside, removes its matching left parenthesis, and leaves a completed operand.

Consecutive unary signs are pushed without prematurely applying them, so the sign closest to the eventual value is evaluated first. At end of line, apply all remaining operations and accept only one final value with no unmatched parenthesis.

## Walkthrough

`789-400+300` is evaluated left to right and gives `689`. In `72/61%7`, remainder has higher precedence, so `61%7=5` is computed first and the result is `72/5=14`.

For `--1`, the inner minus creates `-1`, then the outer minus restores `1`. The line `1 2` contains two adjacent number tokens; whitespace cannot join them into `12`. Likewise, `1(2)` is rejected because implicit multiplication is outside the grammar.

## Why it works

The value stack stores completed subexpressions, while the operator stack stores operations waiting for an operand or for a higher-priority region to finish. When a binary operator arrives, every earlier operation with greater precedence must run first, and an equal-precedence operation must run first because binary operators are left associative. Lower-precedence operations remain for later. Parentheses isolate exactly their internal operations.

The expectation state permits precisely the token categories allowed at each grammar position. The final checks rule out partial parses, unmatched groups, and extra operands. Each accepted operation uses the specified integer semantics, so every valid line receives its defined value and every invalid line is rejected.

## Complexity

With `T` tokens, each operator is pushed and popped at most once, giving `O(T)` structural work and `O(T)` stack space. Arithmetic cost additionally depends on Python big-integer operand sizes.

## Common mistakes

- Reusing the host language's precedence, where `%` normally shares a level with multiplication and division.
- Following the conflicting archived right-recursive grammar instead of the platform's left-associative rule.
- Treating every minus sign as binary.
- Removing whitespace and accidentally joining separate integer tokens.
- Failing to reject unmatched parentheses, unfinished input, or zero divisors.
