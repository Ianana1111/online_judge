Prefix notation puts an operator before its two operands, for example − 7 2. Reading left-to-right encounters the operator before either value is ready. Reading right-to-left prepares the operands first.

Push positive integer literals. For an operator, pop two values: the first is its left operand and the second is its right operand. Reversing − 7 2 pushes 2 then 7, so the subtraction is 7−2. Push the computed result as a completed subexpression for an enclosing operator.

Validate syntax as well. Only positive decimal literals are legal; zero and explicitly signed literals are invalid, though subtraction may produce negatives. Missing operands, division/remainder by zero, and a final stack size other than one all produce illegal. Never ignore extra tokens merely because part of the line forms a valid expression.

Division truncates toward zero, and remainder is a−q·b, carrying the dividend's sign. C/C++ divide magnitudes as decimal strings and restore signs; Java BigInteger.divide/remainder follow the required rule. Arbitrary-precision arithmetic prevents intermediate overflow. Each token is processed once, with additional big-integer arithmetic costs; the stack retains values of unfinished subexpressions. Evaluate one expression per line and stop at a line containing only a period.
