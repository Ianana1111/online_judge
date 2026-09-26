The first continued-fraction coefficient is the floor of a/b. Write a=q·b+r, giving a/b=q+1/(b/r). After recording q, repeat with b/r until the remainder is zero. This is Euclid's algorithm with its quotients retained.

For signed input, first make the denominator positive. Use floor division so 0≤r<b. For example, −3/2 is −2+1/2, not −1−1/2. Java divideAndRemainder truncates toward zero; if its remainder is negative, subtract one from the quotient and add the denominator to the remainder. C/C++ divide magnitudes as decimal strings and apply the same correction.

Decimal long division appends one numerator digit at a time. The preceding remainder is smaller than the divisor, so after appending a digit at most nine subtractions determine the next quotient digit. The string helpers support integers without an unstated machine-size limit; the continued-fraction algorithm itself is just the quotient/remainder loop.

Always print a semicolon after the first coefficient, then commas between later coefficients. An integral value must appear as [q;]. Each next denominator is a smaller remainder, so the process terminates. A decimal division on D digits takes roughly O(D²); total time also depends on Euclidean iterations. Store only the current operands, quotient, and remainder.
