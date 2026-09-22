`ending` returns the increasing-subsequence length at every position, not merely the final size of `tails`. It computes the iterator's numeric position before modifying the vector, avoiding iterator invalidation when `push_back` grows the storage.

The second call processes the reversed values. Reversing its result aligns `right[i]` with the same original center as `left[i]`. The main loop uses the smaller arm, doubles it, and subtracts one so the center is counted once. Initializing the answer to one covers monotone and all-equal inputs.
