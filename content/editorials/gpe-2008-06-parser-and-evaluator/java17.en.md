Do not use the language's built-in eval: local precedence differs from ordinary C and Python. Unary signs bind most tightly, then %, then * and /, then + and −. Binary operations associate left to right.

Maintain a value stack, an operator stack, and `expecting` to indicate whether an operand is required. In that state, + and − are unary signs, while *, /, and % are invalid. Binary operators are allowed only after a number or closing parenthesis. This also rejects adjacent numbers, implicit multiplication, and empty groups.

Before pushing a binary operator, apply operators of greater or equal precedence, ensuring left associativity. Push unary signs without applying them immediately, allowing repeated signs and parenthesized operands. A closing parenthesis applies operators up to its matching opening parenthesis. Missing or unclosed parentheses are invalid.

`apply` consumes one value for unary operations and right-then-left values for binary ones. Division truncates toward zero, remainder follows the dividend's sign, and division by zero reports syntactically incorrect. Exact integer arithmetic avoids overflow, and a valid line leaves exactly one value. Scanning and stack work take O(L) time and O(L) space, plus big-integer arithmetic costs.
