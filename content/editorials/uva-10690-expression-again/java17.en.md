Let total input sum be `T` and one selected group sum be `s`. The other sum is `T-s`, so the objective is `s(T-s)`. Because swapping groups changes neither product, choose exactly `k=min(N,M)` elements for the DP.

`possible[count]` is a bitset of signed sums attainable with exactly `count` selected elements. Offset sums by 2500, since at most fifty selected values of magnitude fifty give range `[-2500,2500]`. Initialize only count zero, sum zero.

For each value, update counts downward. Selecting a positive value shifts the previous-count bitset left; selecting a negative one shifts it right. OR this into the existing state, which represents not selecting the value. Descending count prevents the same element from being used twice.

Finally scan every set bit in `possible[k]`, compute `s(T-s)` in 64 bits, and update both extrema.

Choose the smaller group of k elements and represent reachable sums for each chosen count as a bitset. Shift the previous count’s bits left or right for each new value, then evaluate s(T−s) over every reachable final sum.
