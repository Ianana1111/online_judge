Input uses `BufferedReader` with `StringTokenizer`; `next()` reads another line whenever the current one is exhausted, so blank lines are skipped. Station names map to indices through a `HashMap<String,Integer>`, and roads are stored in `long[][] road` with `Long.MAX_VALUE / 4` as infinity so additions cannot overflow.

Each query runs an O(n²) Dijkstra: the start costs its own fee, each round selects the cheapest unfinished station x, relaxes with `cost[x] + 2 * road[x][y] + fee[y]` and records `prev`.

The route is built by walking `prev` back from the destination and inserting each name at the front of a `StringBuilder`; the destination gets no trailing space, so the string comes out in order with no trailing space. The fare is computed as rounded integer cents and printed as the whole part, the tenths digit and the hundredths digit. The blank line between maps is added only when m > 1.
