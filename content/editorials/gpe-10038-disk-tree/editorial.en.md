# Build the shared folders before printing them

## Problem and constraints

Each case contains 1 to 500 distinct directory paths of at most 80 characters. Backslashes separate directory names, which contain no spaces and have length 1 to 8. Print the directory tree with parents before descendants, siblings in lexicographic order, and one space of indentation per level. Top-level folders have no indentation. Finish each case with a blank line.

## Building the approach

Printing each input path separately repeats shared folders. A global set of folder names is also wrong: `APP\BIN` and `TOOLS\BIN` contain different BIN folders. A folder is identified by its name **and its parent**.

This suggests a tree whose edges are whole directory names. Start at a virtual root for every path. For each component, reuse the child with that name if it exists; otherwise create it. Shared prefixes then become shared nodes, while equally named folders under different parents remain separate.

After building the tree, use preorder traversal: print a child, then all of its descendants. Store children in an ordered map so traversal also supplies sibling sorting. Keeping construction separate from output means the original path order cannot affect the result.

## Walkthrough

Insert `APP\BIN`, `APP\DATA`, and `TEMP`. The first path creates APP and its child BIN. The second reuses APP and adds DATA. The third creates another root child, TEMP. Print APP, then BIN and DATA with one leading space, and finally TEMP with none. APP must appear even though it was never supplied as a complete path by itself.

## Why it works

Inserting components creates exactly one node for each distinct path prefix. Preorder visits each such node once and before all of its descendants. Each parent's ordered map lists its children lexicographically. Increasing the indentation at each recursive step therefore gives exactly the required hierarchy and ordering.

## Complexity

For L total input characters and maximum sibling count D, construction takes O(L log(D + 1)) time. Printing is proportional to the output length. The tree occupies O(L) space, and recursion depth is bounded by the length of a path.

## Common mistakes

- Deduplicating names globally instead of within each parent.
- Printing only leaf folders or only the original complete paths.
- Using input order for siblings.
- Indenting by two or four spaces instead of one.
- Printing the virtual root as a real folder.
