With up to 1001 input digits, floating-point square roots are unreliable. Use the hand-calculation method: process two input digits at a time and determine one root digit. If the current root prefix is p and the next digit is x, the new root is 10p+x.

The square increment is (10p+x)²−100p²=(20p+x)x. Append the next input pair to the remainder, multiplying the old remainder by 100 and adding that pair. Try x from nine down to zero and choose the largest digit whose increment fits. Subtract the increment. The invariant is that p is the integer root of the processed prefix, while the remainder records what its square has not consumed.

C/C++ implement decimal-string addition, subtraction, multiplication, and comparison. General big-integer division is unnecessary: multiplication uses only 20 or a one-digit x. An odd-length input starts with a single-digit group; later groups contain two digits. Append each chosen x to root.

Java 17 provides BigInteger.sqrt for an exact integer root. Since the input is guaranteed to be a perfect square, that is the required result. Separate cases with a blank line. A D-digit input yields roughly D/2 root digits; O(D) rounds each test at most ten small multiplications, giving O(D²) time and O(D) space.
