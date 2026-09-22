Indices zero and one are explicitly marked nonprime. The sieve starts crossing out at `p*p`, and all loops remain below the one-million table limit.

Each prefix entry first copies its predecessor. The digit sum is at most 54 for values in range and is therefore safely checked in the same primality table. Only the conjunction of the two prime flags increments the entry.

Every query performs one prefix subtraction and prints a newline rather than `endl`. Disabled stream synchronization and untied input help handle the stated maximum query count efficiently.
