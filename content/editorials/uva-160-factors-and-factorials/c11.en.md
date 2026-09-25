For a prime p, every multiple of p contributes at least one factor, every multiple of `p^2` contributes one additional factor, and so on. The exponent is therefore `floor(N/p)+floor(N/p^2)+...`.

Sieve all primes through 100. For each p no larger than N, start `quotient=N/p`, repeatedly add it and divide it by p until zero. This avoids both constructing `N!` and explicitly multiplying prime powers. Track printed columns and wrap before the sixteenth value.

For each prime p≤N, add floor(N/p), floor(N/p²), and so on to get its exponent in N!. Wrap after 15 width-three fields with six-space continuation indentation.
