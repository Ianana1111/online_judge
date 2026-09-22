The `dr` and `dc` arrays describe exactly the four vertical and horizontal directions. Each day starts with `next=grid`, preserving cells that receive no successful attack.

The conditional expression maps the current species to its unique enemy. Neighbor indices pass row and column bounds before the old `grid` is read. Multiple matching neighbors merely assign the same enemy value again.

No inner loop mutates `grid`; `grid.swap(next)` occurs only after the full day. The case index controls one blank line before every output block after the first, and a zero-day case naturally skips all updates.
