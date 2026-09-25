For `n > 1`, divisor 1 is always proper, so begin the sum at one. Every remaining divisor `d` is paired with `n / d`. At least one member of each pair is at most `sqrt(n)`, so enumerate `d` from 2 while `d*d <= n`. When `d` divides `n`, add both members, except when they are equal at a perfect square, where the square root must be added once.

The value 1 is the special case: it has no positive proper divisors, so its sum starts at zero. After computing the exact sum, one comparison selects the three mutually exclusive classifications.

One is not its own proper divisor; add factors in pairs, counting a square-root factor only once.
