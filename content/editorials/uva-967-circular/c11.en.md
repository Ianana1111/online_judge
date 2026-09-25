Testing every number again for every query would repeat almost all the work. Since the global upper bound is fixed, first determine primality for every value below one million with the Sieve of Eratosthenes. Then classify each number once and store cumulative counts in a prefix array.

For a `d`-digit value, let `power = 10^(d-1)`. Moving the leading digit to the end is

`(value % power) * 10 + value / power`.

Test the original value and the next `d-1` rotations. If any is composite, the value is not circular. The same `power` must remain in use for the whole cycle, even when a rotation begins with zero and its integer form appears to have fewer digits.

Finally, the inclusive range count is `prefix[right] - prefix[left - 1]`.

Sieve primes below one million, then rotate every candidate with at least three digits and reject it if any rotation is composite. Prefix counts answer each range query in O(1).
