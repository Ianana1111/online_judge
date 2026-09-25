First run a multi-source BFS with every fire cell at time zero. This produces the earliest fire time for every cell; unreachable cells retain infinity. Then run a second BFS from Joe. A move arriving at time `t` is allowed only if `t < fire[next]`; equality is unsafe.

When Joe's BFS removes a boundary cell, return its distance plus one for the step outside. There is no need for that old cell to remain safe during the next minute because Joe has left it. Checking the boundary before enumerating neighbors also makes all later neighbor coordinates valid.

Run multi-source BFS from all fires to find each cell’s earliest fire time. Then BFS from J, entering a cell only strictly before the fire. Leaving from a boundary cell costs one extra step.
