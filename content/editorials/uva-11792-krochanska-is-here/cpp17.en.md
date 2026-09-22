`previous` adds each line's consecutive bidirectional edges until its zero terminator. A per-line `seen` vector increments `lines[v]` no more than once for that line.

Important stations are collected in increasing ID order. Every BFS creates fresh distances and still traverses secondary vertices. Only the final sum filters to important destinations, and `sum<best` keeps the first, smallest ID on ties. Output converts back to one-based numbering.
