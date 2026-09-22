`array<int, 5>` gives every combination the same fixed shape. After sorting it, `++count[courses]` either creates a frequency of one or increments the existing entry. The map compares the complete arrays, so different course sets cannot collide merely because their sums match.

The first map traversal computes `best`. The second adds `entry.second` whenever it equals `best`; adding one instead would count combinations rather than students. Separating these passes also avoids resetting a running winner count incorrectly when a new maximum appears.

All per-case variables are inside the input loop, so counts from earlier groups cannot leak into later answers. The zero count ends input before constructing a new case.
