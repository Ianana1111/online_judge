`row[u][v]` records whether `E` contains the directed edge `u -> v`; duplicate input edges simply set the same bit again. The bitwise `&` finds common successors, and `.any()` asks whether the intersection is nonempty. Only then must the complete bitsets be equal.

Each unordered row pair is checked once because the condition is symmetric. Once `valid` becomes false it stays false, while the already-read case remains properly aligned. With no conflicting pair, including an empty graph, the initial true value is printed using the exact required case format.
