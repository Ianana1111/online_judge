Read one case per line and multiply every `p**e` from its prime/exponent pairs to reconstruct the original number. Only then subtract one and factor again: subtraction can change all prime factors, as in `10 -> 9`.

Try divisors from 2 upward. Repeatedly divide whenever one fits, counting its exponent. A remainder greater than one after trial division is itself prime. The factors were found in ascending order, so reverse them for the required descending output. A line containing only `0` ends input.
