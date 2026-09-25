Set `empty=e+f`. While at least `c` empties remain, exchange `drinks=floor(empty/c)` bottles in one batch and add that number to the answer. The next empty count is the unspent remainder `empty%c` plus one returned empty for each newly consumed soda: `empty%c+drinks`.

The initial bottles are already empty and are not drinks obtained today, so the answer begins at zero. When fewer than `c` remain, no legal action exists.

Reset `empty` and `total` for each case and count only sodas obtained by exchange.
