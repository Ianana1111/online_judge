The essential issue is precedence and associativity. Tokenize the line into values and operators, representing ** as one power operator.

Collapse the expression in three phases. Process powers from right to left: 2**3**2 means compute 3**2, then 2**9. Process multiplication from left to right next, followed by addition/subtraction from left to right. Each collapse replaces two values with their result and removes the intervening operator, preserving the remaining expression's meaning.

C/C++ use arbitrary-precision decimal strings. Binary exponentiation multiplies the current base into the result for an odd exponent, then halves the exponent and squares the base. Handle base one before converting the exponent: even an enormous positive exponent yields one. For other legal power bases, the 3000-digit intermediate limit bounds the exponent below ten thousand. Java similarly handles one first, then uses BigInteger.pow with an exact int exponent.

Addition/subtraction may produce negative results. Read input lines dynamically: a valid line may exceed 3000 characters because that limit applies to arithmetic values, not expression length. With k operations and D-digit values, grade-school multiplication is O(D²), while exponentiation adds O(log e) multiplication steps. Value/operator storage is O(kD).
