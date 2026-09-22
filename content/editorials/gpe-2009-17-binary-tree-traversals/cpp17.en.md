`postorder(preStart, inLeft, inRight)` describes subtrees with indices into the original strings, avoiding copied input ranges. An empty half-open inorder interval returns immediately. `split` searches only inside the current subtree's inorder range.

`leftSize` determines both the left range and the right subtree's preorder start. The expression `left + right + root` places the root last. Before each case, both global strings are resized to `n`, preventing characters from a longer previous case from remaining. Character extraction with `cin >> c` naturally skips input whitespace.
