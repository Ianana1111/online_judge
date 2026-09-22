# Reduce exact big-integer expressions in precedence order

## Problem and constraints

Each line is a valid expression of positive integers with `+,-,*,**`, no spaces or parentheses, at most 100 operations, and literals up to 1,000 digits. Powers are right-associative; all evaluated intermediates and answers on this platform have absolute value below `10^3000`, with at most 50 expressions. Print one exact integer per line.

## Building the approach

Tokenize numbers and operators, recognizing `**` before single `*`. Keep parallel arrays where operator i joins values i and i+1.

First repeatedly reduce the rightmost exponentiation, implementing right associativity and highest precedence. Next reduce the leftmost multiplication until none remain. Finally fold remaining addition and subtraction left to right. Python integers preserve exact large and negative values, and no `eval` or floating arithmetic is needed.

## Walkthrough

`2+3*4**2-5` reduces power to 16, multiplication to 48, then gives 45. `3-12` gives -9. `2**3**2` evaluates `3**2` first and yields 512 rather than left-associated 64.

## Why it works

Replacing any recognized subexpression by its exact value preserves the whole expression. Rightmost-first powers match right-associative highest precedence; leftmost products match their next precedence and associativity without crossing plus/minus. The final left fold matches addition/subtraction rules. Therefore reductions evaluate exactly the specified parse tree, with arbitrary precision preventing overflow or rounding.

## Complexity

With K operators, array searches and splices cost at most `O(K^2)`, plus the true cost of big-integer arithmetic on values up to 3,000 digits. Storage is `O(KD)` for digit bound D.

## Common mistakes

- Using floating `pow`.
- Tokenizing `**` as two multiplications.
- Ignoring precedence.
- Evaluating power chains left-to-right or subtraction right-to-left.
- Printing visual continuation backslashes from the PDF.
