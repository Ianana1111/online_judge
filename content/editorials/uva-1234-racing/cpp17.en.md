### From maximum spanning tree to the implementation

Each tuple stores `(cost, u, v)`, so sorting with reverse iterators visits the most expensive roads first. Ties may choose a different spanning tree, but do not change its maximum total weight.

`DSU::find` identifies the current component and compresses the path. `unite` joins different components using their sizes. Its return value directly answers our greedy question: `true` means the road can stay unmonitored without forming a cycle; `false` means it closes a cycle among already kept roads.

Only that false branch adds to `answer`. We never need to enumerate a cycle or explicitly subtract the tree's cost afterward. A fresh DSU and zero answer are created for each case, and the initial case count controls the input loop. The two endpoints of each stored tuple remain attached to their cost throughout sorting.
