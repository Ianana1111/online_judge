`getline` preserves each variable-length pair list, and its `istringstream` stops exactly at the line end. `value` is rebuilt only through integer multiplication and remains within the declared bound.

As factors are removed, `rest` shrinks, so the loop condition `d*d <= rest` can terminate early. A nonzero `count` is recorded once per prime. Any remaining `rest > 1` is appended with exponent one. Reversing the vector produces descending primes, while the output index controls single spaces between pairs.
