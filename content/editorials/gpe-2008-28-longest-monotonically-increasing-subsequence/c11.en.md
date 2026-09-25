Computing one LIS or only its length is insufficient because every maximum path must be emitted. Since `n` is at most nine, we can first learn which choices are capable of completing an optimal path and then enumerate them all.

Let `up[i]` be the maximum length of a strictly increasing subsequence starting at index `i`. Compute it from right to left. It is initially one, and any later index `j` with `value[j] > value[i]` may extend it to `1 + up[j]`. The global maximum `L` is the largest `up[i]`.

During depth-first search, keep the next allowed index, the chosen values, and the number of elements still needed. An index is eligible when it is later than all chosen indices, its value is larger than the previous value, and `up[i]` equals the remaining length. The last condition discards branches that cannot finish an LIS.

First compute the longest path starting at each index. Enumerate only paths that can finish a global LIS. Different index paths count separately even if their printed values match.
