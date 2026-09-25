Precompute primality for every possible frequency from zero through 2000. Mark zero and one nonprime, then use the Sieve of Eratosthenes to remove multiples beginning at each prime's square.

For one case, count characters in a fixed 128-entry array. Scan indices from zero upward and append the character whenever `prime[count[ch]]` is true. This single scan produces ASCII order automatically: digits, then uppercase letters, then lowercase letters.

A fresh zeroed count array is required for every test case.

Primality applies to occurrence counts, not character codes; print `empty` if none qualify.
