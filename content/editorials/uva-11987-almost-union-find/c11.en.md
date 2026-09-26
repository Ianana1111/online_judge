Separate the label p from its union-find node. Reparenting the old node could drag its descendants along. Keep id[p] as the current representative node; a move removes p from the old root's count and sum, allocates one new node, and attaches that node to the destination root.

Find roots through id[p] for every operation. Maintain the live element count separately from the union weight: abandoned nodes still belong to the tree structure. At most one node is allocated per move, so n+m+1 slots suffice. Store set sums in 64-bit arithmetic.
