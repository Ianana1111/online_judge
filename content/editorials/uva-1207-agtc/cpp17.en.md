`previous` initializes to `0..n`, the insertion costs from empty source. Each new row sets `current[0]=i`; increasing `j` ensures the current-row left cell and both previous-row cells are ready.

String indices are prefix lengths minus one. Rows swap only after completion. For `m=0`, no row runs and `previous[n]` already contains the answer. Conditional string extraction preserves token alignment for zero lengths.
