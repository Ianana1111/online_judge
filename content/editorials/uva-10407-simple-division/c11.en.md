For every number to have the same remainder modulo d, choose the first number a as a reference. Another number b has the same remainder exactly when d divides b−a. Thus the largest candidate is the gcd of all absolute differences from a.

Start answer at zero and update gcd(answer,|b−a|). Since gcd(0,x)=x, this handles the first nonzero difference naturally; identical values leave zero, following this platform's convention. Negative numbers pose no difficulty because divisibility depends on the absolute difference.

The final zero on each line is a terminator, not a sequence element. A line containing only zero ends the entire input. C/C++ use signed decimal-string subtraction and unsigned Euclidean division to avoid an unstated integer bound. Java uses BigInteger.subtract, abs, and gcd.

Compute each difference once. With n values of at most D digits, the main work is n arbitrary-precision gcd operations. This implementation's individual decimal division takes roughly O(D²), repeated until the remainder is zero. Beyond the input line, keep only the first number, running gcd, and current difference.
