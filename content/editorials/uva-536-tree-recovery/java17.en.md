The next unused preorder character is the root of the current subtree. Its position in inorder uniquely divides that subtree into a left interval and a right interval. Recursively process the left interval, then the right, and append the root afterward to produce postorder.

Precompute every label's inorder position so recursive calls do not search repeatedly. A shared preorder index advances once whenever a root is selected; recursion itself visits subtrees in preorder root-left-right order, so this one index always points to the correct next root. Use half-open inorder intervals `[left,right)` and return on an empty interval.

No explicit node objects are necessary because only the final traversal is requested.

The next preorder letter is the current root. Its inorder position splits left and right subtrees. Emit both subtrees before appending the root to form postorder.
