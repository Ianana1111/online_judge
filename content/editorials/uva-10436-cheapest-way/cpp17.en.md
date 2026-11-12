Each map reads station names and fees first, with a `map<string,int>` from name to index. Roads go into an n × n `road` matrix initialized to a large `INF`; a road updates the matrix only when it is shorter, so parallel roads keep the shortest automatically, and both directions are written.

Before printing `Map #m`, every map except the first prints a blank line, so blank lines appear only between maps. Each query runs an O(n²) Dijkstra: `cost[src]` starts at the start's fee, each round picks the unfinished station x with the smallest cost, tries to improve y with `cost[x] + 2 * road[x][y] + fee[y]`, and records `prev[y] = x`.

The route is collected by following `prev` from the destination back to the start and printed in reverse. The fare uses integers: `(cost[dst] * 220 + passengers) / (2 * passengers)` gives the rounded number of cents, printed as `cents / 100`, a decimal point and two digits.
