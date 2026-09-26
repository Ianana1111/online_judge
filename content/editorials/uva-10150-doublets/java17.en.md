Treat dictionary words as graph vertices, with an edge between words differing in exactly one letter. A shortest transformation is a BFS path, reconstructed through predecessor links.

Comparing every word pair is too slow. Remove one position at a time: cat gives *at, c*t, and ca*. Words sharing a pattern differ only at its missing position. Sort and group patterns into buckets, then discover neighbors through those buckets.

Expand each bucket at most once per query. When first reached from distance d, every member can be discovered at d+1; later expansions cannot improve that distance. `seen` records the query number and `previous` records BFS predecessors.

To avoid many pattern strings, encode letters 1..26 in five bits, use zero at the missing position, and include word length. Different lengths or missing positions cannot collide. C uses a 128-bit integer; Java keeps the complete representation in two long values; Python uses arbitrary-precision integers and compact bucket arrays.

For S total dictionary characters and V words, preprocessing takes O(S log S), each BFS O(S+V), and storage O(S+V). Missing endpoints, differing lengths, or unreachable targets produce No solution. A word queried against itself requires only that word.
