Future legality depends only on each current stack top, not on deeper contents. Keep all top letters in sorted order. A new letter `ship` can be placed on a stack whose top is at least `ship`.

Among eligible stacks, choose the smallest top. This preserves larger tops for future large letters and is exactly the first position returned by `lower_bound`. Replace that top with `ship`; if no such position exists, append a new stack.

Replacing at the boundary preserves sorted order. Equality is allowed, which is why `lower_bound` rather than `upper_bound` is required. This process is also the tails algorithm for the strict longest increasing subsequence.

Place each container on the leftmost stack whose top is at least its letter; otherwise open a new stack, using binary search.
