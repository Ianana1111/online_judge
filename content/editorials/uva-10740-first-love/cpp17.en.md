Input labels are converted to zero-based indices. Every input edge remains in its adjacency list, so parallel edges are not merged.

The `greater` priority queue is a min-heap. `popped[u]` counts accepted arrivals rather than merely recording visited status. A record is skipped only after the vertex already has K accepted prefixes.

The algorithm stops only when the target's count becomes exactly K. All earlier target arrivals continue through outgoing edges. Zero weights and equal-cost heap entries need no special handling. The initial answer `-1` remains when the heap exhausts before K target arrivals.
