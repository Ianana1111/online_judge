The output requires every simplification step, not only the final value. Parse the left side into integer values and binary operators. The right-side variable is a label, not an unknown to solve.

A number's own sign may be adjacent to the preceding binary operator. For example, 1--2 means one minus negative two. Read the optional sign and intervening whitespace as part of the next number, then read its digits; only afterwards read the following binary operator.

In each round find the leftmost multiplication or division. If none remains, choose the leftmost addition/subtraction. Replace its two operands with the result, remove the operator and extra value, and print the entire current expression. One collapse per round preserves left associativity within precedence groups and every required intermediate state.

Division is guaranteed exact with a nonzero divisor, so no fractions or rounding are needed. C/C++ use signed decimal strings and Java uses BigInteger. Print the normalized original equation first, then one line after each operation, keeping = variable even when only one value remains. Separate equations with a blank line.

There are at most twenty operations. Repeated linear operator searches and array shifts cost O(k²), plus arbitrary-precision arithmetic and rendering all states. Store O(k) numeric values.
