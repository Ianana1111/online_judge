The whole input is split into tokens and consumed in order by `take()`, so blank lines or extra spaces between names and numbers do not matter. A dictionary `station` maps names to indices, and roads go into an n × n `road` matrix keeping only the shortest of any parallel roads.

Each query runs an O(n²) Dijkstra: the start costs its own fee, each round picks the cheapest unfinished station and relaxes neighbors with 2 × distance plus the neighbor's fee, recording `prev`. With fewer than 20 stations a plain list scan is fast and no heap is needed.

The route is collected from the destination along `prev` and reversed with `reversed`. The fare uses the integer expression `(cost * 220 + passengers) // (2 * passengers)` for rounded cents, formatted as `f"{cents // 100}.{cents % 100:02d}"`. Each map's output forms one block, and blocks are joined with a blank line, so nothing extra follows the last map.
