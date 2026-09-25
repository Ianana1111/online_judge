Only 35 bases exist, so compute every one. For base b, repeatedly take `x%b` to obtain the least significant digit value, add its symbol cost, and set `x/=b`. The order of digits does not affect the sum, so no representation string or reversal is needed.

Use a do-while loop so number zero still processes one digit zero. Reset x from the original query for every base.

Maintain `best` and a list of tied bases. A strictly smaller total replaces the best and clears the list; an equal total appends the base. Enumerating bases upward keeps the list sorted.

Check bases 2 through 36 independently, extracting digits with remainder and division. A do-once loop counts the single zero digit when the input number is zero.
