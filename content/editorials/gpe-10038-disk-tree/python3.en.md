Printing each input path separately repeats shared folders. A global set of folder names is also wrong: `APP\BIN` and `TOOLS\BIN` contain different BIN folders. A folder is identified by its name **and its parent**.

This suggests a tree whose edges are whole directory names. Start at a virtual root for every path. For each component, reuse the child with that name if it exists; otherwise create it. Shared prefixes then become shared nodes, while equally named folders under different parents remain separate.

After building the tree, use preorder traversal: print a child, then all of its descendants. Store children in an ordered map so traversal also supplies sibling sorting. Keeping construction separate from output means the original path order cannot affect the result.

A folder is identified by its parent and name. Build the shared-prefix tree first, then print each parent’s children in sorted order.
