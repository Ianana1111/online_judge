# Recover postorder from preorder and inorder

## Problem and constraints

For each binary tree, preorder and inorder traversals are given; output the postorder traversal. A tree contains 1 to 26 nodes labeled with uppercase letters, and the supplied traversals describe the same recoverable tree. Preorder is root-left-right, inorder is left-root-right, and postorder is left-right-root. We only need the resulting sequence, so explicit pointer-based tree nodes are unnecessary.

## Building the approach

The two traversals provide complementary facts. The first node of a preorder region is its root. Finding that root in the matching inorder region reveals exactly which nodes belong to the left and right subtrees.

Represent a subtree by preorder start `preStart` and the half-open inorder range `[inLeft, inRight)`. If the range is empty, its postorder is empty. Otherwise, find the preorder root at inorder position `split`. The left subtree has `leftSize = split-inLeft` nodes, so its preorder starts at `preStart+1`; the right subtree begins after the root and all left nodes, at `preStart+1+leftSize`.

Recursively produce the left and right postorders, then append the root. This directly follows postorder's definition.

## Walkthrough

Take preorder `A B D E F C G` and inorder `D B F E A G C`. The root is `A`. Four inorder nodes lie to its left and two to its right.

The left subtree uses preorder `B D E F` and yields postorder `D F E B`. The right subtree uses `C G` and yields `G C`. Appending `A` gives `D F E B G C A`.

## Why it works

Induct on subtree size. An empty subtree correctly returns an empty sequence. For a nonempty subtree, preorder identifies its root, and the root's inorder position uniquely separates the exact left and right node sets. Their preorder starts follow from the known left-subtree size.

By the induction hypothesis, both recursive calls return correct postorders for their smaller subtrees. Concatenating left result, right result, and root is precisely the postorder definition. Therefore the outer call returns the correct traversal of the complete tree.

## Complexity

Linear searching for a root and concatenating strings at each recursion level gives `O(n^2)` worst-case time. Recursion depth is at most `n`, and a conservative bound including temporary strings is `O(n^2)` extra space. With `n <= 26`, this simple method is ample.

## Common mistakes

- Starting the right preorder region immediately after the root without skipping the left subtree.
- Appending the root first and accidentally reproducing preorder.
- Swapping the left and right recursive results.
- Including `split` in a child half-open inorder range.
- Omitting required spaces between output labels.
