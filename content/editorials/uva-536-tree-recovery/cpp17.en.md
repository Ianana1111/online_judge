`position[label-'A']` gives the global inorder index directly. `build(left,right)` limits the active subtree, while shared `next` tracks preorder consumption. Selecting a root increments `next` before descending so the following call sees its subtree's next root.

The left interval ends before `middle`, and the right begins at `middle+1`, excluding the root from both. `answer += root` appears after both recursive calls, exactly implementing postorder. Position storage, index, and answer are recreated for each input pair.
