The parser consumes exactly `n+1` distances per case. `low` is their maximum, ensuring every individual segment fits, and `high` their sum, ensuring a feasible bound.

`days` begins at one and `walked` tracks the current day's sum. A new day starts only on strict overflow, with the current segment as its first distance. Comparing against `nights+1` permits later insertion of additional stays. Standard lower-bound binary search leaves `low == high` at the minimum feasible limit.
