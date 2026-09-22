Write a parser and evaluator for arithmetic expressions using nonnegative decimal integer literals, parentheses, unary signs and binary +, -, *, /, %.

### LOCAL grammar and evaluation rules

The archived right-recursive grammar conflicts with its own sample: 789-400+300 evaluates to 689. This platform explicitly uses left-associative binary operators and the precedence already demonstrated by 72/61%7 = 14. The reviewed grammar is:

```text
E = T { ("+" | "-") T }
T = R { ("*" | "/") R }
R = F { "%" F }
F = "(" E ")" | "-" F | "+" F | N
N = D { D }
D = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
```

Precedence from highest to lowest: unary signs; remainder; multiplication/division; addition/subtraction. Repetition in E, T and R is evaluated left to right. Whitespace may separate tokens, but cannot join separate integer tokens into one number. Implicit multiplication and empty parentheses are not allowed. Division truncates toward zero; remainder is a - trunc(a/b)*b. Division or remainder by zero is reported as syntactically incorrect.

### Input

Each input line is an independent expression, with length less than 1024. Read until end of file. All integer calculations are exact.

### Output

For each line, print case 1: (using consecutive case numbers), then the result on the next line. If the line is not accepted or contains an undefined division, print syntactically incorrect instead of a number. Print an empty line after each case.
