A very lucky thief found n keys on a street with m houses. He knows that each key opens exactly one
door so he wants to know which door is, but he also wants to do the less number of tries in order to
avoid the security systems.

### Input

The first line contains a single integer, T (T ≤ 100000) indicating the number of test cases. The
following T lines contain two integers n and m, 1 ≤ n ≤ m ≤ 100000.

### Output

Print the minimum number of tries that the thief must perform in order to know what key opens each
door with an end of line.

### LOCAL platform clarification

Different keys open different doors: the unknown assignment is injective. Find the minimum guaranteed number of trials in the worst case, not an average or best-case count. A final possible door can be inferred without another trial.
