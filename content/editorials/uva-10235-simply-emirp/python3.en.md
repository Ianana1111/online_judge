Separate the definition into three checks: the original number must be prime, its reversal must be prime, and the two numbers must differ. Applying them in that order prevents a composite whose reversal happens to be prime from being misclassified, and the inequality excludes palindromic primes.

For primality, reject values below two and try every possible divisor through the square root. A composite number always has at least one factor no greater than its square root, so no larger trial divisor is needed.

To reverse the digits, repeatedly take the last digit with `% 10`, append it to `reversed` after multiplying the current result by ten, and remove the processed digit with `/= 10`. Keep the original `n` unchanged for classification and output.

An emirp needs both the original and reversed number prime and different; a palindromic prime is only prime.
