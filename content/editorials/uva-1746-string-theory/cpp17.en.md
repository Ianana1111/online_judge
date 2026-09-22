`valid` copies run lengths so candidate levels remain independent. Odd total quotes fail immediately. Level one separately requires exactly two; higher levels reserve at least two inner quotes.

Pointers skip only zero runs. Each layer verifies both ends, including combined `2*layer` capacity when they coincide, then subtracts from both and the total. The outer loop is bounded by endpoint runs and the necessary `k(k+1)` quote count, stopping at the first valid descending k.
