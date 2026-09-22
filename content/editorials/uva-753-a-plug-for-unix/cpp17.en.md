`ids` maps every type mentioned by outlets, devices, or adapters, including types appearing only in a chain. The complete id set is built before allocating Dinic. Device names are consumed but only their type affects compatibility.

`add` creates both forward and residual edges and handles self-loop reverse indices. BFS builds levels and `send` pushes along increasing levels; residual capacity can undo an earlier choice for a better matching. Source and sink edges have capacity one, while adapter edges use `m`. The final output subtracts flow and inserts blank lines only between datasets.
