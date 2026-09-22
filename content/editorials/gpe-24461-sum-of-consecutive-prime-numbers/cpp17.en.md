The sieve marks zero and one nonprime, then crosses out multiples beginning at each prime's square. Collecting marked values in numeric order makes every contiguous index range exactly a consecutive-prime sequence.

Each target begins with fresh `left`, `sum`, and `answer` values. The shrinking loop may remove several primes before testing equality. Only primes no greater than the target enter the window, and the positive target prevents an empty zero-sum match. After a match, normal right extension continues searching for later intervals.
