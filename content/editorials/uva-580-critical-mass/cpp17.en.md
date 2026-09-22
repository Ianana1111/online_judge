The 31-entry `safe` array covers indices zero through thirty. After the three independent bases are set, every later state reads only completed shorter values, so one precomputation serves queries in any order.

`1LL << n` produces the exact 64-bit power of two before subtracting the safe count. Queries for one and two naturally yield zero, while only the actual zero sentinel is excluded. The table is never modified during queries.
