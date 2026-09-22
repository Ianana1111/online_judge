The sieve correctly leaves 1 marked nonprime; each case adds it explicitly with `values{1}` before appending genuine primes, keeping the list ordered and avoiding duplicate logic.

`length % 2` subtracts one from the requested count for odd lengths, and `min` clips it to the whole list. `start` centers the half-open range `[start, start + take)`. Each value is printed with one leading space after the colon, and the two newline characters provide the required blank line between cases.
