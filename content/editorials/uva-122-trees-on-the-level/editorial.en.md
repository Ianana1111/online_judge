# Build paths first, then validate and traverse the whole tree

## Problem and constraints

Each token `(n,s)` assigns a positive value `n` to the node reached from the root by path `s`, where `L` and `R` choose children and an empty path means the root. Assignments may arrive in any order. `()` ends one tree. Print its left-to-right level order only if every created path node is assigned exactly once; otherwise print `not complete`. A tree has at most 256 specified nodes.

## Building the approach

Create the root and follow every path, allocating unassigned intermediate nodes when needed. At the destination, a preexisting value marks the entire tree invalid, even if the repeated number is identical. A child may legitimately be read before its parent, so missing assignments cannot be rejected until `()`.

At the terminator, run BFS from the root. Any visited node without a value proves that some required ancestor was never assigned. Enqueue left before right to obtain the requested order. Collect the traversal before printing so that a late missing node cannot leave partial output.

## Walkthrough

Suppose the right child is assigned 2, the left-left grandchild 3, then the root 1 and left child 4. The delayed validation accepts the tree and BFS prints `1 4 2 3`. If the left child assignment never arrives, its placeholder remains empty and the tree is incomplete. Assigning the root twice is also invalid regardless of equal values.

## Why it works

Every binary path identifies exactly one node, and following its characters creates exactly that position. Duplicate detection gives each position at most one assignment. The final BFS verifies every created position has at least one assignment, including all intermediate ancestors, so every required node is assigned exactly once. BFS visits by depth and enqueues each parent's left child before its right child, yielding the required level order.

## Complexity

Let `P` be the total length of all input paths and `V` the number of created nodes. Construction takes `O(P)` time, validation and traversal take `O(V)`, and the tree, queue, and output use `O(V)` space.

## Common mistakes

- Checking only that the root exists while ignoring missing ancestors.
- Allowing a path to be assigned the same value twice.
- Printing in input order.
- Emitting a partial traversal before validation finishes.
- Keeping vector element references across a reallocation.
