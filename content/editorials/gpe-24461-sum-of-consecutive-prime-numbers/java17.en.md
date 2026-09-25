First use the sieve of Eratosthenes to build all primes through 10,000 in increasing order. For one target, maintain a contiguous window with two pointers and its sum. Extend the right edge by one prime. While the sum is too large, remove primes from the left until it is no larger than the target. If it equals the target, count one representation.

All prime values are positive. For a fixed right edge, moving the left edge strictly decreases the sum, so at most one left position can match the target. Once a left position has been discarded for an excessive sum, later right extensions cannot make that old window smaller, so it never needs to return.

Stop adding when the next prime exceeds the target, since no nonempty window containing it can match.

Sieve the ordered primes first. For each target, grow a consecutive-prime window and shrink it whenever its sum is too large; equality counts one representation, even a single prime.
