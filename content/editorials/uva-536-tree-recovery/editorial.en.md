# Use preorder roots to split inorder intervals and emit postorder

## Problem and constraints

Given preorder and inorder traversals of the same binary tree, output its postorder traversal. Nodes are distinct uppercase letters, with 1 to 26 nodes, and each pair is guaranteed valid. Preorder is root-left-right, inorder is left-root-right, and postorder is left-right-root. Cases continue to end of file.

## Building the approach

The next unused preorder character is the root of the current subtree. Its position in inorder uniquely divides that subtree into a left interval and a right interval. Recursively process the left interval, then the right, and append the root afterward to produce postorder.

Precompute every label's inorder position so recursive calls do not search repeatedly. A shared preorder index advances once whenever a root is selected; recursion itself visits subtrees in preorder root-left-right order, so this one index always points to the correct next root. Use half-open inorder intervals `[left,right)` and return on an empty interval.

No explicit node objects are necessary because only the final traversal is requested.

## Walkthrough

For preorder `DBACEGF` and inorder `ABCDEFG`, root `D` divides inorder into `ABC` and `EFG`. The left side yields postorder `ACB`, the right yields `FGE`, and appending `D` produces `ACBFGED`. A single node `A` has empty children and outputs `A`.

## Why it works

Induct on subtree size. An empty interval emits nothing. For a nonempty subtree, preorder's next character is its root, and uniqueness makes its inorder position the exact division between left and right node sets. By induction, the two recursive calls consume and emit correct postorders for those smaller subtrees. Appending the root after them gives left-right-root, the correct postorder. Every node is consumed once and belongs to exactly one interval.

## Complexity

Building positions and traversing both take `O(N)` time. The answer and worst-case recursion stack use `O(N)` space.

## Common mistakes

- Appending the root before its children and reproducing preorder.
- Visiting the right subtree before the left.
- Including the root in a child interval.
- Resetting the preorder index inside recursive calls.
- Mixing inclusive and half-open interval boundaries.
