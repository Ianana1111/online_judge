`join` first calls `find` on both endpoints. It returns false for equal roots and true only when the component count truly decreases. The smaller tree is attached below the larger, and sizes are maintained only at roots.

`find` compresses every traversed parent directly to the root on return. This improves later queries without changing membership.

Rather than counting distinct raw parent values at the end, `groups` starts at `n` and decrements on successful merges; uncompressed intermediate parents therefore cannot be mistaken for roots. Array index zero is unused, while students one through `n` each contribute one initial group.
