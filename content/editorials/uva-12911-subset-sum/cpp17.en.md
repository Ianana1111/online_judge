`sums` starts with the empty choice. For each value, it freezes the previous list size before appending old sums plus that value, ensuring the element is chosen at most once. Sorting deliberately does not call `unique`.

The two pointers group equal matching values. Multiplicity counters and the answer are `long long`, so their product is wide. Subtracting once for target zero removes only the two-empty-halves pairing; all nonempty zero-sum choices remain.
