The same cursor cell may be reached after typing different prefix lengths, so ordinary grid BFS is insufficient. Use state (cell,progress), representing cursor position and the number of selected target characters. Append Enter's * to the text and handle it identically.

An arrow does not move one cell: skip the contiguous run of the current key and stop at the first different key. If none exists, it does not move; such a useless press cannot improve a shortest path. Precompute each cell's directional destinations.

A state has two transition types: arrows change cell without changing progress, and selecting the required next character increments progress without moving. Both cost one stroke, so ordinary BFS on this product graph finds the optimum. Repeated target characters still require separate selections.

Flatten visited indices as progress·cell count+cell. C/Python use byte arrays and Java uses BitSet. Python first restricts to cursor cells reachable from the start and renumbers them; unreachable cells never need states.

Process one distance layer at a time. For a fixed cursor cell, the shortest time for a longer typed prefix is strictly larger: deleting its final selection yields the same cursor and a shorter prefix with one fewer stroke. Therefore at most one newly reached progress per cell appears in a BFS layer. C/Java's two frontier arrays need only V entries each.

With V≤2500 cells and L≤10001 target characters, worst-case state/time complexity is O(VL), plus directional navigation preprocessing. Visited storage is O(VL), while frontier storage is O(V).
