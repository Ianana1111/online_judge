Every fire cell is assigned time zero and queued before the first BFS, while `INT_MAX` means never reached by fire. After that queue empties, the same queue receives Joe's start and a separate distance array tracks safe visits.

The boundary test precedes neighbor indexing, safely covering one-row, one-column, and one-cell maps. `arrival >= fire[next]` rejects both late and simultaneous arrivals. A remaining answer of `-1` means all safely reachable cells were exhausted without escape.
