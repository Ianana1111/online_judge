The two traversals provide complementary facts. The first node of a preorder region is its root. Finding that root in the matching inorder region reveals exactly which nodes belong to the left and right subtrees.

Represent a subtree by preorder start `preStart` and the half-open inorder range `[inLeft, inRight)`. If the range is empty, its postorder is empty. Otherwise, find the preorder root at inorder position `split`. The left subtree has `leftSize = split-inLeft` nodes, so its preorder starts at `preStart+1`; the right subtree begins after the root and all left nodes, at `preStart+1+leftSize`.

Recursively produce the left and right postorders, then append the root. This directly follows postorder's definition.

The first preorder node is the root, which splits inorder into left and right subtrees; recurse then append the root for postorder.
