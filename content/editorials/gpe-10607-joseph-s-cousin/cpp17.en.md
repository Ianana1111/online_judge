Prime generation tests each candidate only against earlier primes up to its square root. The table stops after 3,500 entries, enough for the maximum number of eliminations.

`survivor = 0` describes the single remaining person's local position. In the ascending `size` loop, `primes[n - size]` deliberately moves backward through the elimination primes: the first restoration undoes the last round, while the final restoration uses prime two.

The modulo operation keeps the restored position within the current circle. Only after all restorations does `survivor + 1` convert to the statement's labels. With n = 1, the loop executes zero times and this same output expression gives one.
