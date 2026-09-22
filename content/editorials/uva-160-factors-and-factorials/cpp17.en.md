The sieve starts with all entries unmarked, records each new prime, and marks from `p*p` because smaller multiples already have a smaller factor. Repeated quotient division yields exactly floor divisions by successive powers without multiplication overflow.

`setw(3)` applies only to the next item, so it is repeated for N and every exponent. The six-character first-line prefix aligns with six spaces on continuation lines. When `column==15`, the code wraps before printing the next exponent, and one final newline ends each case.
